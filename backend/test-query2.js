import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const query = {
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() },
    $expr: { $lt: ["$usedCount", "$usageLimit"] }
  };

  const andConditions = [];
  const orConditions = [
    {
      restrictedToEmail: { $in: [null, "", undefined] },
      restrictedToPhone: { $in: [null, "", undefined] },
      code: { $not: /^COMP-/i }
    }
  ];

  const userEmail = "rk1054055@gmail.com";
  const personalizedConditions = [];
  personalizedConditions.push({ restrictedToEmail: new RegExp(`^${userEmail}$`, 'i') });
  orConditions.push({ $or: personalizedConditions });

  andConditions.push({ $or: orConditions });
  query.$and = andConditions;

  console.log(JSON.stringify(query, null, 2));

  const coupons = await mongoose.connection.collection('coupons').find(query).toArray();
  console.log("Returned codes:", JSON.stringify(coupons.map(c => c.code)));
  process.exit(0);
});
