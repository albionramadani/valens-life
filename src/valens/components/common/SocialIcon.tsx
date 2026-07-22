import { Link } from "@tanstack/react-router";

const social_icon: string[] = ["fab fa-facebook-f", "fab fa-instagram", "fab fa-tiktok"];

const SocialIcon = () => {
   return (
      <>
         {social_icon.map((icon, index) => (
            <Link key={index} to="#"><i className={icon}></i></Link>
         ))}
      </>
   )
}

export default SocialIcon;
