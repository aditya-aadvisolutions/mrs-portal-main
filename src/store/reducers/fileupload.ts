import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import  IUploadFiles from '../Models/UploadFiles';


const initialState = Array<IUploadFiles>();

export const fileUploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setUploadedFiles: (state: Array<IUploadFiles>, action: PayloadAction<IUploadFiles>) => {
      state.push({
        filename: action.payload.filename,
        fileId: action.payload.fileId,
        size: action.payload.size,
        fileextension: action.payload.fileextension,
        filepath: action.payload.filepath,
        pageCount: action.payload.pageCount
      })
    },
    removeUploadedFiles: (state: Array<IUploadFiles>) => {
        state?.pop?.();
    },
    removeAllUploadedFiles: (state: Array<IUploadFiles>) => {
        state.length = 0;
    }
  },
});

export const { setUploadedFiles, removeUploadedFiles, removeAllUploadedFiles } = fileUploadSlice.actions;

export default fileUploadSlice.reducer;
