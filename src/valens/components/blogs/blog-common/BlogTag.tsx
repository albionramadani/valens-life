import { Link } from "@tanstack/react-router";

const tag_data: string[] = ["Popular", "desgin", "ux", "usability", "develop", "icon", "business", "kit", "consult", "mouse", "tech", "keyboard"];
const BlogTag = () => {
   return (
      <div className="widget mb-40">
         <div className="sidebar-title mb-25">
            <h3 className="title">Popular Tags</h3>
         </div>
         <div className="widget-tag">
            <ul className="list-wrap">
               {tag_data.map((tag, i) => <li key={i}><Link to="#">{tag}</Link></li>)}
            </ul>
         </div>
      </div>
   )
}

export default BlogTag
