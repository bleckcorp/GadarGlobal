export default function handler(request, response) {
  const phone = process.env.GADAR_CONTACT_PHONE || '+1 (234) 567-890';
  response.status(200).json({
    email: process.env.GADAR_CONTACT_EMAIL || 'hello@gadar.io',
    phone,
    phoneHref: process.env.GADAR_CONTACT_PHONE_HREF || phone.replace(/[^\d+]/g, ''),
    location: process.env.GADAR_CONTACT_LOCATION || 'Global Remote Team',
  });
}
