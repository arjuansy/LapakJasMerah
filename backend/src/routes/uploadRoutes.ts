import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

router.post('/', protect, upload.single('image'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ message: 'Gagal mengunggah gambar ke cloud', error });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    res.status(200).json({
      message: 'Upload berhasil',
      imageUrl: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error saat upload', error });
  }
});

export default router;
