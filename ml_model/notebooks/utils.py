import os

import nibabel as nib
import numpy as np
from skimage.transform import resize
from tensorflow.keras.utils import to_categorical


class util:
    @staticmethod
    def load_nifti(file_path):
        print(f"Loading file: {file_path}")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        nifti_img = nib.load(file_path)
        return nifti_img.get_fdata()

    @staticmethod
    def preprocess_data(volume_path, segmentation_path, img_size=(128, 128), num_classes=3):
        """Load and preprocess volume and segmentation data"""
        volume_data = util.load_nifti(volume_path)
        segmentation_data = util.load_nifti(segmentation_path).astype(int)

        volume_data = (volume_data - np.min(volume_data)) / (np.max(volume_data) - np.min(volume_data))

        volume_resized = np.array([
            resize(slc, img_size, mode='constant', preserve_range=True)
            for slc in volume_data.transpose(2, 0, 1)
        ])
        segmentation_resized = np.array([
            resize(slc, img_size, mode='constant', preserve_range=True, order=0)
            for slc in segmentation_data.transpose(2, 0, 1)
        ])

        segmentation_onehot = to_categorical(segmentation_resized, num_classes=num_classes)

        return volume_resized, segmentation_onehot
    
    @staticmethod
    def get_volume_dir() -> str:
        cwd = os.getcwd()
        project_root = cwd if os.path.isdir(os.path.join(cwd, "dataset")) else os.path.abspath(os.path.join(cwd, ".."))
        VOLUME_DIR = os.path.join(project_root, "dataset", "train", "volumes")
        return VOLUME_DIR
    
    @staticmethod
    def get_segment_dir() -> str:
        cwd = os.getcwd()
        project_root = cwd if os.path.isdir(os.path.join(cwd, "dataset")) else os.path.abspath(os.path.join(cwd, ".."))
        SEGMENTATION_DIR = os.path.join(project_root, "dataset", "train", "segmentation")
        return SEGMENTATION_DIR
    
    @staticmethod
    def get_test_volume_dir() -> str:
        cwd = os.getcwd()
        project_root = cwd if os.path.isdir(os.path.join(cwd, "dataset")) else os.path.abspath(os.path.join(cwd, ".."))
        VOLUME_DIR = os.path.join(project_root, "dataset", "test", "volumes")
        return VOLUME_DIR
    
    @staticmethod
    def get_test_segment_dir() -> str:
        cwd = os.getcwd()
        project_root = cwd if os.path.isdir(os.path.join(cwd, "dataset")) else os.path.abspath(os.path.join(cwd, ".."))
        SEGMENTATION_DIR = os.path.join(project_root, "dataset", "test", "segmentation")
        return SEGMENTATION_DIR
    
    @staticmethod
    def get_segment_model_dir()-> str:
        cwd = os.getcwd()
        project_root = os.path.abspath(os.path.join(cwd, "models"))
        return project_root


        