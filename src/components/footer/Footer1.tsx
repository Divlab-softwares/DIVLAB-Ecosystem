import { Facebook, Youtube } from "lucide-react"
import { Instagram } from "lucide-react"
import Link from "next/link";
import Image from "next/image";
// import Whatsapp from "../../../public/assets/Whatsapp3.png";
// import Whatsapp1 from "../../../public/assets/Whatsapp2.svg";

// import DIVLABLogo from "../../../public/assets/logo.jpg";

interface Footer1props {
    className?: string;
}

const Footer1 = ({ className }: Footer1props) => {
    return (
        <footer className={`flex md:flex-row flex-col md:items-center items-start justify-between bg-base-200 text-base-content p-20 md:p-10 ${className} relative`} id="footer">

            <aside className="flex flex-col items-start justify-start gap-1">
                <Link href="https://divlabs-tech.com" target="_blank" className="flex items-center font-bold text-2xl md:text-xl flex-col space-y-3">
                    <Image width={256} height={256} src={"/images/logo/logo.jpg"} alt="" className="w-16 h-16 rounded-full  border border-info shadow-[0_5px_20px_rgba(0,200,255,0.6)]" />
                    <p className="font-bold">
                        DIVLAB
                    </p>
                </Link>
                <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
                <p>Made by DIVLAB</p>
            </aside>
            <div className="flex md:flex-row flex-col item-start justify-start gap-8">
            <nav className="my-2">
                <div className="flex flex-row gap-4">
                    <Link href="https://www.facebook.com/share/16wnRmhYcd" target="_blank"><Facebook /></Link>
                    {/* <Link href=""><Instagram /></Link>
                    <a href="#"><X /></a> 
                    <Link href=""><Youtube /></Link> */}
                    <Link href="whatsapp://send?phone=237652509674" target="_blank" className="">
                            <Image width={256} height={256} src={"/images/logo/Whatsapp2.svg"} alt="" className="w-6 h-6  mr-2" />
                    </Link>
                </div>

            </nav>
            
                <nav className="flex flex-col">
                    <h6 className="text-md font-medium mb-2 text-black dark:text-gray-700">SERVICES</h6>
                    <Link className="hover:underline" href="https://divlabs-tech.com/Services" target="_blank">Formations</Link>
                    <Link className="hover:underline" href="https://divlabs-tech.com/Services/#design" target="_blank">Design</Link>
                    <Link className="hover:underline" href="https://divlabs-tech.com/Services/#ia" target="_blank">IA (Intelligence artificielle)</Link>
                    <Link className="hover:underline" href="https://divlabs-tech.com/Services/#solutions web" target="_blank">Solutions Web & cloud</Link>
                </nav>

                <nav className="flex flex-col">
                    <h6 className="text-md font-medium mb-2 text-black dark:text-gray-700">COMPANY</h6>
                    <Link className="hover:underline" href="https://divlabs-tech.com/#about" target="_blank">A propos</Link>
                    <Link className="hover:underline" href="https://divlabs-tech.com/#realisations" target="_blank">Realisations</Link>
                    <Link className="hover:underline" href="https://divlabs-tech.com/#contact" target="_blank">Formulaire de contact</Link>
                    <Link className="hover:underline" href="https://divlabs-tech.com/#team-section" target="_blank">Equipe DIVLAB</Link>
                    {/* <a className="link link-hover">Press kit</a> */}
                </nav>

                <nav className="flex flex-col">
                    <h6 className="text-md font-medium mb-2 text-black dark:text-gray-700">LEGAL</h6>
                    <Link className="hover:underline" href="https://divlabs-tech.com/cgv" target="_blank">CGV</Link>
                    <Link className="hover:underline" href="https://divlabs-tech.com/privacy-policy" target="_blank">Privacy policy</Link>
                    {/* <a className="link link-hover">Cookie policy</a> */}
                </nav>
            </div>
        </footer>
    );
}

export default Footer1;
