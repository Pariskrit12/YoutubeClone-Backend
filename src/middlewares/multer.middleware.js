import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Store uploaded files in the './public/temp' directory
  },
  filename: function (req, file, cb) {
    // Define how the uploaded file should be named
    cb(null, file.originalname); // Use the original name of the uploaded file
  },
});

export const upload = multer({
  storage,
});
