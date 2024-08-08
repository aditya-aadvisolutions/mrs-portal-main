import React, { useEffect, useRef } from 'react';
import ProgressBar from '@ramonak/react-progress-bar';
import { FaFileDownload } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const DownloadProgress = ( progress:any, onCancel:any ) => {
    console.log(progress, "progress");
    console.log(onCancel)
    useEffect(() => {
        if (progress.progress === 100) {
            toast.success("Download completed successfully!");
        }
    }, [progress]);
    return (
        <>
            {onCancel ? (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 999999,
                }}>
                    <div style={{
                        width: '400px',
                        padding: '20px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        textAlign: 'center',
                    }}>
                        <FaFileDownload size={50} style={{ marginBottom: '20px', color: '#6a1b9a', }} />
                        <ProgressBar
                            completed={progress.progress}
                            bgColor="#6a1b9a"
                            height="20px"
                            labelColor="#ffffff"
                            baseBgColor="#e0e0df"
                            labelAlignment="center"
                            borderRadius="5px"
                        />
                        {/* <Button
                            variant="danger"
                            onClick={onCancel}
                            style={{ marginTop: '20px', width: '100%', }}
                        >
                            Cancel
                        </Button> */}
                        <ToastContainer />
                    </div>
                </div>
            ) : null}
        </>
    );
};


export default DownloadProgress;
