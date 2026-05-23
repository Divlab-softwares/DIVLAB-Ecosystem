"use client";

import React from "react";
import { Input } from '@/components/lightswind/input';
import { Label } from '@/components/lightswind/label';
import { Button } from '@/components/lightswind/button';
import { Textarea } from '@/components/lightswind/textarea';
import Notification from '@/components/notification/Notification';
import { useForm, ValidationError } from '@formspree/react';
import { useState, useRef, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { useMutation } from "@tanstack/react-query";

const ContactForm = () => {

    const [state, handleSubmit] = useForm("mvgbzjer");
    const [MessageColor, setMessageColor] = useState("bg-transparent");
    const [succeed, setSucceed] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    // On surveille les changements d'état de Formspree
    useEffect(() => {
        if (state.succeeded) {
            setSuccess("Message envoyé avec succès !");
            setFormData({ name: "", surname: "", email: "", message: "" }); // Reset du formulaire
            setMessageColor("bg-green-200");
            setLoading(false)
        }
        if (state.errors ) {
            setMessageColor("bg-red-500 ");
            setError("Une erreur est survenue lors de l'envoi.");
            setLoading(false)
        }
        if (state.submitting) {
            setMessageColor("bg-gray-300 animate-pulse  border border-info shadow-[0_5px_20px_rgba(0,200,255,0.6)]");

        }
    }, [state.succeeded, state.errors]);

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess("");
                setError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        message: "",
    });

    const handleFormSubmit = () => {
       setLoading(true)
    }




    return (
        <div className=" " id="contact">
            {/* <Title title="Vos avis et messages" /> */}

            <div className="flex flex-col justify-center items-center h-auto w-full ">

                <div className='bg-slate-200 relative h-fit w-full   p-10 m-2 rounded-xl text-black flex  flex-col border border-info shadow-[0_5px_20px_rgba(0,200,255,0.6)]'>
                    <h1 className='font-extrabold uppercase  text-3xl'> Contactez-nous</h1>
                    <hr />
                    <p className='text-md mt-5'> Nous sommes present pour vous aider, notre equipe professionnelle vous repondra dans les 4h suivantes</p>

                    <div className='w-full flex flex-col items-start md:ml-10 ml-2 mt-10 pb-5'>
                        <p className='text-gray-600  font-bold'>Email</p>
                        <span className="font-bold text-md  mb-5 mt-1">divlabsoftware@gmail.com</span>

                        <p className='text-gray-600 font-bold'>Appelez nous + whatsapp</p>
                        <span className="font-bold text-md  mb-5 mt-1">+237 652509674</span>

                        <p className='text-gray-600 font-bold'>Notre adresse</p>
                        <span className="font-bold text-md  mb-5 mt-1">Cameroun | Douala</span>
                    </div>
                    <div className='absolute rounded-2xl bg-white/20 -bottom-30 -right-6 border border-info shadow-[0_5px_20px_rgba(0,200,255,0.6)] w-45 h-45'>

                    </div>
                    <div className='absolute rounded-2xl bg-white/10 -bottom-50 right-25 border border-info shadow-[0_5px_20px_rgba(0,200,255,0.6)] w-35 h-35'>

                    </div>
                </div>

                <form onSubmit={ handleSubmit} method="POST" className="relative  flex flex-col justify-between w-full  h-fit p-10 m-2 border border-info rounded-xl bg-black/80 shadow-[0_5px_20px_rgba(0,200,255,0.6)]">

                    <div className='pb-5 flex-col flex items-align justify-center'>
                        <h1 className='font-bold uppercase  text-xl text-gray-300 dark:text-gray-300'> Formulaire de contact</h1>
                        <hr />
                    </div>


                    <div className='w-full flex items-center flex-row justify-between mb-4'>

                        <div className='w-1/2 '>
                            <Label htmlFor="text" className="text-gray-300 dark:text-gray-300">Nom</Label>
                            <Input required type="text" name="name" placeholder="Votre Nom"
                                value={formData.name}
                                onChange={handleChange}
                                className='bg-white text-black' />
                            <ValidationError
                                prefix="Name"
                                field="name"
                                errors={state.errors}
                            />
                        </div>


                        <div className='w-1/2 ml-3'>
                            <Label htmlFor="text" className="text-gray-300 dark:text-gray-300">Prénom</Label>
                            <Input type="text" name="surname" placeholder="Votre prénom" value={formData.surname}
                                onChange={handleChange} className='bg-white text-black' />
                            <ValidationError
                                prefix="Surname"
                                field="surname"
                                errors={state.errors}
                            />
                        </div>

                    </div>


                    <div className='mb-4'>
                        <Label htmlFor="email" className="text-gray-300 dark:text-gray-300">Email</Label>
                        <Input required type="email" name="email" placeholder="Votre email" value={formData.email}
                            onChange={handleChange} className='bg-white text-black' />
                        <ValidationError
                            prefix="Email"
                            field="email"
                            errors={state.errors}
                        />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="text" className='h-100 text-gray-300 dark:text-gray-300'>Votre message</Label>
                        <Textarea rows={10} required name="message" placeholder="Votre message" value={formData.message}
                            onChange={handleChange} className='bg-white/50 text-black' />
                        <ValidationError
                            prefix="Message"
                            field="message"
                            errors={state.errors}
                        />
                    </div>

                    <div className='flex justify-center w-full mt-5'>
                        <Button type="submit" variant='outline' disabled={state.submitting} size="lg" className='form w-full bg-blue-600 text-gray-300 dark:text-gray-300'> Soumettre</Button>
                    </div>
                    <div className={`w-full p-2  h-5 ${MessageColor} text-center text-black absolute bottom-0 left-0 rounded-b-xl flex flex-col justify-center items-center font-bold`}>  {success && <p>{success}</p>}</div>

                    <div className='absolute rounded-2xl bg-white/20 -z-1 -bottom-10 -left-8 border border-info shadow-[0_5px_20px_rgba(0,200,255,0.6)] w-45 h-45'>

                    </div>
                    <div className='absolute rounded-2xl bg-white/10 -z-1 -bottom-20 left-25 border border-info shadow-[0_5px_20px_rgba(0,200,255,0.6)] w-35 h-35'>

                    </div>
                </form>

            </div>
            {error != "" && (
                <Notification state="error" title="Erreur lors de l'opération" message={error} />
            )}
            <div className="flex flex-col fixed bottom-2 left-2 justify-center items-center ">
                {/* Tu peux utiliser n'hui importe quel loader de la liste */}
                <ClipLoader
                    color="#36d7b7"
                    loading={loading}
                    size={50}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>
            {success && (
                <Notification state="success" title="Opération réussie" message="" />
            )}
        </div>
    );
}

export default ContactForm;
