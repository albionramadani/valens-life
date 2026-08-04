import { Link } from "@tanstack/react-router";

const social_icon = [
   { icon: "fab fa-facebook-f", label: "Facebook" },
   { icon: "fab fa-instagram", label: "Instagram" },
   { icon: "fab fa-tiktok", label: "TikTok" },
];

const SocialIcon = () => {
   return (
      <>
         {social_icon.map((item, index) => (
            <Link key={index} to="#" aria-label={item.label}>
               <i className={item.icon} aria-hidden="true"></i>
            </Link>
         ))}
      </>
   )
}

export default SocialIcon;
