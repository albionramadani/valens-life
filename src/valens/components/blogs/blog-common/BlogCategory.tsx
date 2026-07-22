import { Link } from "@tanstack/react-router";

type Datatype = {
   title: string,
   count: string;
}
const category_data: Datatype[] = [
   { title: "Business", count: "26" }, { title: "Consultant", count: "30" },
   { title: "Creative", count: "71" }, { title: "UI/UX", count: "56" }, { title: "Technology", count: "60" },
]

const BlogCategory = () => {
   return (
      <div className="widget mb-40">
         <div className="sidebar-title mb-25">
            <h3 className="title">Categories</h3>
         </div>
         <div className="sidebar-cat">
            <ul className="list-wrap">
               {category_data.map((category, i) => (<li key={i}><Link to="#">{category.title} <span>{category.count}</span></Link></li>))}
            </ul>
         </div>
      </div>
   )
}

export default BlogCategory
