import mongoose from 'mongoose';

const connectDB = async() => {
    try{
        mongoose.connection.on('connected', () => console.log('Database connected'))
        await mongoose.connect(`${process.env.MONGODB_URL}/pingup`)
    } catch(error) {
        console.log(error.message)
    }
}

export default connectDB

// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     if (mongoose.connection.readyState >= 1) {
//       // already connected
//       return;
//     }

//     await mongoose.connect(`${process.env.MONGODB_URL}/pingup`, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     mongoose.connection.on('connected', () => console.log('Database connected'));
//   } catch (error) {
//     console.error('Database connection error:', error.message);
//   }
// };

// export default connectDB;
