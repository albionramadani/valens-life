"use client"
import { toast } from 'react-toastify';

import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

interface FormData {
   name: string;
   email: string;
   message: string;
}

const schema = yup
   .object({
      name: yup.string().required().label("Name"),
      email: yup.string().required().email().label("Email"),
      message: yup.string().required().label("Message"),
   })
   .required();

const ReviewForm = () => {

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
   const onSubmit = (data: FormData) => {
      const notify = () => toast('Comment sent successfully', { position: 'top-center' });
      notify();
      reset();
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         <p>Your email address will not be published.Required fields are marked <span>*</span></p>
         <div className="from-grp">
            <label htmlFor="name">Your name <span>*</span></label>
            <input type="text" {...register("name")} id="name" />
            <p className="form_error">{errors.name?.message}</p>
         </div>
         <div className="from-grp">
            <label htmlFor="email">Your email <span>*</span></label>
            <input type="text" {...register("email")} id="email" />
            <p className="form_error">{errors.email?.message}</p>
         </div>
         <div className="from-grp checkbox-grp">
            <input type="checkbox" id="checkbox" />
            <label htmlFor="checkbox">Don’t show your email address</label>
         </div>
         <div className="form-rating">
            <label>your rating</label>
            <ul className="list-wrap">
               <li>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
               </li>
            </ul>
         </div>
         <div className="from-grp">
            <label htmlFor="comment">Write Your review <span>*</span></label>
            <textarea {...register("message")} id="comment"></textarea>
            <p className="form_error">{errors.message?.message}</p>
         </div>
         <button className="eg-btn">Submit Now</button>
      </form>
   )
}

export default ReviewForm
