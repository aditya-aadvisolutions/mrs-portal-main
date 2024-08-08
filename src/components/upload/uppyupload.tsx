/* eslint-disable */
import React, { Component, useEffect, useState } from "react";
import { DashboardModal, DragDrop, ProgressBar, FileInput } from "@uppy/react";
import Dashboard from "@uppy/dashboard";
import DropTarget from "@uppy/drop-target";
import Uppy, { UploadResult, UppyFile } from "@uppy/core";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/progress-bar/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import XHRUpload from "@uppy/xhr-upload";
import { useDispatch, useSelector } from "react-redux";
import { setUploadedFiles, removeUploadedFiles } from "@store/reducers/fileupload";
import store from "@app/store/store";
import IUploadFiles from "@app/store/Models/UploadFiles";
import AwsS3Multipart from "@uppy/aws-s3-multipart";
import LookupService from "@app/services/lookupService";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Header from "react-bootstrap/ModalHeader";
import ModalHeader from "react-bootstrap/ModalHeader";
import { PDFDocument } from 'pdf-lib';
import { extractRawText } from "mammoth";

export default function UppyUpload(props: any) {
  let uppy: any;
  const [uploading, setUploading] = useState(false);
  const [duplicateFileError, setDuplicateFileError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalFile, setModalFile] = useState<any>('');

  const uploadUrl = import.meta.env.VITE_S3_URL;
  const Role = localStorage.getItem("authentication") ? JSON.parse(localStorage.getItem("authentication") as string).roleName : "";
  const { fileNames } = useLocation().state || { fileNames: [] };

  const [fileTypes, setFileTypes] = useState([]);
  const dispatch = useDispatch();
  const [uppyInstance, setUppyInstance] = useState<Uppy | null>(null);
  const { isSingle } = useLocation().state || { isSingle: []};  
  const uploadedFiles = useSelector(
    (state: Array<IUploadFiles>) => store.getState().uploadfile
  );
  const getFileTypes = async () => {
    const response: any = await LookupService.getStatus('filetypes');
    if (response.isSuccess) {
      setFileTypes(response.data)
    }
  }

  const getWordPageCount = async (arrayBuffer: any) => {
    const result = await extractRawText({ arrayBuffer });
    const text = result.value;
    const lines = text.split(/\r?\n/);
    const linesPerPage = 45; // Average lines per page assumption
    return Math.ceil(lines.length / linesPerPage);
  }


  useEffect(() => {
    if (props.admin && props.admin === true) {
      getFileTypes();
    }
  }, [props.admin]);
  useEffect(() => {
    const uppy = new Uppy({
      restrictions: {
        allowedFileTypes: props.filePreference ? props.filePreference === '.pdflnk' ? ['.pdf'] : props.filePreference.split(',') : ['.pdf', '.doc', '.docx', '.tif', '.tiff']
      },
      id: "uppyloader",
      autoProceed: false,
      debug: true,

      locale: {
        strings: {
          noDuplicates: "File with same name already exists, if you would like to continue uploading please rename and try again",
        },
      },
      onBeforeUpload: (files: any) => {
        if (props.onBeforeUpload) {
          props.onBeforeUpload();
        }
        return true;
      }
    })
      .use(Dashboard, {
        inline: true,
        target: "#uppyUpload",
        showProgressDetails: true,
        proudlyDisplayPoweredByUppy: false,
        height: 300,
        width: "100%"
      })
      .use(DropTarget, {
        target: document.body,
      })
      .use(AwsS3Multipart, {
        limit: 4,
        companionUrl: uploadUrl
      });

    uppy.on("complete", (result: UploadResult) => {
      let files = result.successful.filter(function (item) {
        return uploadedFiles.filter((x) => x.filename !== item.name);
      });

      for (let i = 0; i < files.length; i++) {
        let filenameWithOutFolder
        let extension = '';
        if (files[i].name.includes('.pdf')) {
          extension = '.pdf';
        } else if (files[i].name.includes('.docx')) {
          extension = '.docx';
        } else if (files[i].name.includes('.pdflnk')) {
          extension = '.pdflnk';
        } else {
          extension = '.' + files[i].name.split('.').pop();
        }

        if (Role === 'Admin') {
          filenameWithOutFolder = (files[i].name).split('/admin/')[1];
        } else {
          filenameWithOutFolder = (files[i].name).split('/client/')[1];
        }

        dispatch(
          setUploadedFiles({
            fileId: files[i].id,
            filename: filenameWithOutFolder,
            size: files[i].size,
            fileextension: props.filePreference && props.filePreference != '' ? props.filePreference : extension,
            filepath: files[i].uploadURL,
            pageCount: files?.[i]?.meta?.pageCount ?? 0
          })
        );
      }
      props.onCompleteCallback();
    })
    uppy.on('upload-error', () => {
      uppy.cancelAll()
      dispatch(removeUploadedFiles());  
    });
    uppy.on('upload-error', () => {
      uppy.cancelAll()
      dispatch(removeUploadedFiles());  
    });

    uppy.on('files-added', async (files: any) => {
      setDuplicateFileError(false)
      let clientName = sessionStorage.getItem('username');
      const date = new Date();
      let folderStructure;
      if (clientName !== null) {
        const isoString = date.toISOString();
        const year = isoString.slice(0, 4);
        const month = isoString.slice(5, 7);
        const day = isoString.slice(8, 10);
        folderStructure = clientName.concat(" - ").concat(`${year}-${month}-${day}`);
      } else {
        folderStructure = "Client name is not available";
      }

      for (const prop in files) {

        const file = files[prop];
        const originalName = file.name;
        let pageCount = 0;
        const buffer = await file?.data?.arrayBuffer?.();
        if (file?.extension === 'pdf') {
          // const pdf = await PDFDocument.load(buffer);
          // pageCount = pdf.getPageCount();
          try {
            const pdf = await PDFDocument.load(buffer);
            pageCount = pdf.getPageCount();
          } catch (error) {
            pageCount = 0;
          }
        } else if (['doc', 'docx'].includes(file?.extension)){
          pageCount = await getWordPageCount(buffer);
        }
        
        if(file?.meta) file.meta.pageCount = pageCount;
        const extension = originalName.slice(originalName.lastIndexOf('.'));
        const nameWithoutExtension = originalName.slice(0, originalName.lastIndexOf('.'));
        const newClientFileName = `${folderStructure} - ${nameWithoutExtension}${extension}`;
        const newAdminFileName = `${nameWithoutExtension}${extension}`
        if (Role === 'Admin') {
          file.name = "/admin" + '/' + newAdminFileName;
        } else {
          file.name = "/client" + '/' + newClientFileName;
        }

        if (!isSingle) {
          if (fileNames.includes(nameWithoutExtension + extension)) {
            setShowModal(true);
            setModalFile(file);
            return;
          }
        }

      }
    })

      .setOptions({
        restrictions: {
          allowedFileTypes: props.filePreference ? props.filePreference === '.pdflnk' ? ['.pdf'] : props.filePreference.split(',') : ['.pdf', '.doc', '.docx', '.tif', '.tiff'],
          maxNumberOfFiles: (props.admin && props.admin === true ? 1 : undefined),
          maxFileSize: 1073741824
        },
      });
      setUppyInstance(uppy);
    return () => uppy.close(); 

  }, []);

  const handleModalConfirm = () => {
    setShowModal(false);
  };

  const handleModalCancel = () => {
    if (modalFile && uppyInstance) {
      uppyInstance.removeFile(modalFile.id);
    }
    setShowModal(false);
  };
  useEffect(() => {
    return () => {
      uppy?.close({ reason: "unmount" });
    };
  }, [props.onCompleteCallback, props.filePreference, Role, uploadedFiles]);


  return <><div id="uppyUpload">
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <ModalHeader placeholder={undefined}>
        <Modal.Title>Duplicate File Detected</Modal.Title>
      </ModalHeader>

      <Modal.Body>
        <p><strong>File already exists.</strong> Do you want to continue uploading?</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleModalConfirm}>
          Continue Uploading
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
  </>
}