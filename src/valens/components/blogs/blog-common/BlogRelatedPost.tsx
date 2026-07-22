import { Link } from '@tanstack/react-router';
type StaticImageData = any;
const Image = (props: any) => { const { src, alt = '', width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = props; const ss = typeof src === 'string' ? src : (src && src.src) || ''; return <img src={ss} alt={alt} width={width} height={height} {...rest} />; };
const blog_rc_img_1 = "/assets/img/blog/rp_post01.jpg";
const blog_rc_img_2 = "/assets/img/blog/rp_post02.jpg";
interface DataType {
   id: number;
   img: StaticImageData;
   date: string;
   title: string;
   desc: React.ReactElement
}[]

const rc_post_data: DataType[] = [
   {
      id: 1,
      img: blog_rc_img_1,
      date: "4 March, 2023",
      title: "A series of iOS 7 inspire vector icons sense.",
      desc: (<>Lorem ipsum dolor sit amet, conse ctet ur adipisicing elit sed doing.</>),
   },
   {
      id: 2,
      img: blog_rc_img_2,
      date: "10 March, 2023",
      title: "Sed ut perspiciatis unde omnis iste natus.",
      desc: (<>Lorem ipsum dolor sit amet, conse ctet ur adipisicing elit sed doing.</>),
   },
]

const BlogRelatedPost = () => {
   return (
      <div className="related-post mt-45">
         <h3>Releted Post</h3>
         <div className="row">
            {rc_post_data.map((item) => (
               <div key={item.id} className="col-md-6">
                  <div className="single-rp mb-45">
                     <div className="rp-thumb">
                        <Link to="#"><Image src={item.img} alt="img" /></Link>
                     </div>
                     <div className="rp-content">
                        <span className="rp-date"><i className="far fa-calendar-alt"></i>{item.date}</span>
                        <h4><Link to="#">{item.title}</Link></h4>
                        <p>{item.desc}</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}

export default BlogRelatedPost
