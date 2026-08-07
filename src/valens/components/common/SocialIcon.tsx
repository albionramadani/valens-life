const social_icon = [
   {
      icon: "fab fa-facebook-f",
      label: "Facebook",
      href: "https://www.facebook.com/valenslifee",
   },
   {
      icon: "fab fa-instagram",
      label: "Instagram",
      href: "https://www.instagram.com/valens.ks",
   },
   {
      icon: "fab fa-tiktok",
      label: "TikTok",
      href: "https://www.tiktok.com",
   },
];

const SocialIcon = () => {
   return (
      <>
         {social_icon.map((item, index) => (
            <a
               key={index}
               href={item.href}
               target="_blank"
               rel="noopener noreferrer"
               aria-label={item.label}
            >
               <i className={item.icon} aria-hidden="true"></i>
            </a>
         ))}
      </>
   )
}

export default SocialIcon;
