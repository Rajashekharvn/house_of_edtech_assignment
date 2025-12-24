import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";

export default async function MyProfileRedirect() {
    const user = await checkUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Redirect to the user's actual profile page using their database ID
    redirect(`/profile/${user.id}`);
}
