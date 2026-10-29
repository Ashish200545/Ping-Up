import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try{
        const {userId} = await req.auth();
        if(!userId){
            return res.status(401).json({success: false, message: "not authenticated" })
        }

        req.userId = userId

        next()
    } catch (error) {
        res.json({success: false, message: error.message })
    }
}

// export const syncUser = async (req, res, next) => {
//   try {
//     const { userId, sessionClaims } = await req.auth();

//     let user = await User.findOne({ clerkId: userId });

//     if (!user) {
//       user = await User.create({
//         clerkId: userId,
//         full_name: sessionClaims?.name || "User",
//         username: sessionClaims?.username || "user",
//         profile_picture: sessionClaims?.image || "",
//       });

//       console.log("User synced to DB:", userId);
//     }

//     req.dbUser = user;
//     next();
//   } catch (err) {
//     console.error("User sync error:", err);
//     res.status(500).json({ message: "User sync failed" });
//   }
// };


export const syncUser = async (req, res, next) => {
  try {
    const { userId, sessionClaims } = await req.auth();

    // Since your schema uses _id = Clerk userId
    let user = await User.findById(userId);

    if (!user) {
      user = await User.create({
        _id: userId,   // REQUIRED by your schema

        email:
          sessionClaims?.email ||
          sessionClaims?.email_addresses?.[0]?.email_address ||
          "noemail@pingup.com",   // fallback (prevents validation error)

        full_name: sessionClaims?.name || "User",   // REQUIRED

        username:
          sessionClaims?.username ||
          `user_${userId.slice(-5)}`,   // ensures unique username

        profile_picture:
          sessionClaims?.image ||
          sessionClaims?.picture ||
          "",
      });

      console.log("User synced to DB:", userId);
    }

    req.dbUser = user;
    next();
  } catch (err) {
    console.error("User sync error:", err);
    res.status(500).json({ message: "User sync failed" });
  }
};
