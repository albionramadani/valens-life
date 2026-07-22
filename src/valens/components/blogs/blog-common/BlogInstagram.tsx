type StaticImageData = any;
const Image = (props: any) => { const { src, alt = '', width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = props; const ss = typeof src === 'string' ? src : (src && src.src) || ''; return <img src={ss} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router"

const blogInsta_1 = "/assets/img/blog/insta_post01.jpg";
const blogInsta_2 = "/assets/img/blog/insta_post02.jpg";
const blogInsta_3 = "/assets/img/blog/insta_post03.jpg";
const blogInsta_4 = "/assets/img/blog/insta_post04.jpg";
const blogInsta_5 = "/assets/img/blog/insta_post05.jpg";
const blogInsta_6 = "/assets/img/blog/insta_post06.jpg";
const blogInsta_7 = "/assets/img/blog/insta_post07.jpg";
const blogInsta_8 = "/assets/img/blog/insta_post08.jpg";
const blogInsta_9 = "/assets/img/blog/insta_post09.jpg";
const insta_data: StaticImageData[] = [blogInsta_1, blogInsta_2, blogInsta_3, blogInsta_4, blogInsta_5, blogInsta_6, blogInsta_7, blogInsta_8, blogInsta_9]

const BlogInstagram = () => {
   return (
      <div className="widget mb-40">
         <div className="sidebar-title mb-25">
            <h3 className="title">Instagram Feeds</h3>
         </div>
         <div className="sidebar-insta-post">
            <ul className="list-wrap">
               {insta_data.map((item, index) => (
                  <li key={index}>
                     <Link to="#">
                        <Image src={item} alt="img" />
                     </Link>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   )
}

export default BlogInstagram
