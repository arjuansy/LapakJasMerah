import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter').max(50, 'Nama maksimal 50 karakter'),
    email: z.string().email('Format email tidak valid').endsWith('@webmail.umm.ac.id', 'Harus menggunakan email @webmail.umm.ac.id'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    university: z.string().optional(),
    location: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
  }),
});
