import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const email = user.emailAddresses[0]?.emailAddress || "";

    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      email.split("@")[0];

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      if (
        (!loggedInUser.name ||
          loggedInUser.name === "null null" ||
          loggedInUser.name === "undefined undefined") &&
        name
      ) {
        return await db.user.update({
          where: {
            clerkUserId: user.id,
          },
          data: {
            name,
            imageUrl: user.imageUrl,
            email,
          },
        });
      }

      return loggedInUser;
    }

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};