const whitelist = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://con-tu-carta-resistiremos.com',
  'https://www.con-tu-carta-resistiremos.com'
];
export const corsOptions = {
  origin: function(origin: any, callback: any) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
