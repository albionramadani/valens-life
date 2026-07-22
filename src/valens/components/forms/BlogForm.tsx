"use client"
import { toast } from 'react-toastify';

import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

interface FormData {
   name: string;
   email: string;
   message: string;
   web: string;
}

const schema = yup
   .object({
      name: yup.string().required().label("Name"),
      email: yup.string().required().email().label("Email"),
      message: yup.string().required().label("Message"),
      web: yup.string().required().label("Website"),
   })
   .required();

const BlogForm = () => {

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
   const onSubmit = (data: FormData) => {
      const notify = () => toast('Comment sent successfully', { position: 'top-center' });
      notify();
      reset();
   };

   return (
      <div className="post-comments-form">
         <div className="comment-wrap-title mb-35">
            <h5>Post Comment</h5>
         </div>
         <div className="comment-box">
            <form onSubmit={handleSubmit(onSubmit)} className="comment-form">
               <div className="comment-field text-area mb-20">
                  <i className="fas fa-pencil-alt"></i>
                  <textarea {...register("message")} id="message" placeholder="Your comments.."></textarea>
                  <p className="form_error">{errors.message?.message}</p>
               </div>
               <div className="comment-field mb-20">
                  <i className="far fa-user"></i>
                  <input type="text" {...register("name")} placeholder="Your name.." />
                  <p className="form_error">{errors.name?.message}</p>
               </div>
               <div className="comment-field mb-20">
                  <i className="far fa-envelope"></i>
                  <input type="email" {...register("email")} placeholder="Your email.." />
                  <p className="form_error">{errors.email?.message}</p>
               </div>
               <div className="comment-field mb-20">
                  <i className="fas fa-globe"></i>
                  <input type="url" {...register("web")} placeholder="Your website.." />
                  <p className="form_error">{errors.web?.message}</p>
               </div>
               <button className="eg-btn"><i className="far fa-comments"></i> Post Comment</button>
            </form>
         </div>
      </div>
   )
}

export default BlogForm
