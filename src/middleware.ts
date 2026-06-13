import { withAuth } from "next-auth/middleware";

// הגנה על כל עמודי הממשק — משתמש לא מאומת מופנה ל-/login.
// נתיבי API מגינים על עצמם (מחזירים 401), לכן הם מוחרגים כאן.
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    // הגן על הכל חוץ מ: api, login, נכסים סטטיים
    "/((?!api|login|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
