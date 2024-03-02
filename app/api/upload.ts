// app/api/upload.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import nextConnect from 'next-connect';

// Configure multer for file storage
const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads', // Ensure this directory exists
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

const apiRoute = nextConnect({
  onError(error, req, res: NextApiResponse) {
    res.status(501).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' is not allowed` });
  },
});

// Use the multer middleware to handle file uploads
apiRoute.use(upload.array('file'));

apiRoute.post((req: NextApiRequest, res: NextApiResponse) => {
  // The files are available on req.files
  // Perform any additional processing or database operations here

  return res.status(200).json({ message: 'Files uploaded successfully', files: req.files });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser to use multer
  },
};
