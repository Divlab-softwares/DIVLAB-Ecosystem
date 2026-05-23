import React from "react";
import Image from "next/image";
import Link from 'next/link';
import {
    DEFAULT_BACK_COVER,
    DEFAULT_FRONT_COVER,
    resolvePublicImage,
    shouldBypassNextImageCache,
} from "@@/lib/imageSources";

interface BentoData {
    title: string;
    description: string;
    frontCover: string;
}

type Courses = {
    id: string,
    title: string,
    description: string,
    domain: string,
    state: string,
    roomCode: string,
    date_start: Date,
    date_end: Date,
    time: number,       // Image représentative
    price: number,  // Lien public du fichier
    trainerId: string,
    // trainer: User,  // formateur
    createdAt: Date,
    updatedAt: Date,
    language: string,
    currency: string,
    frontCover: string,
    backCover: string,
};

// const data: BentoData[] = []

const BentoItem = ({ item, index }: { item: Courses; index: number }) => {
    // Logique d'alternance pour la grille (7/3, puis 3/7)
    // Ligne 1 (index 0,1) -> 7 et 3 | Ligne 2 (index 2,3) -> 3 et 7
    const isLarge = index % 4 === 0 || index % 4 === 3;
    const imageSrc = isLarge
        ? resolvePublicImage(item.backCover, "images", DEFAULT_BACK_COVER)
        : resolvePublicImage(item.frontCover, "images", DEFAULT_FRONT_COVER);

    return (
        <Link href={{
            pathname: "/course_details",
            query: {
                courseId: item.id.toString(),
                DL_LV: true
            },
        }}
            className={`relative overflow-hidden rounded-2xl group min-h-75 border border-white/10 shadow-2xl
      ${isLarge ? "md:col-span-7" : "md:col-span-3"}`}

        >
            {/* Image de fond avec overlay progressif */}
            <Image
                src={imageSrc}
                alt={item.title}
                fill
                unoptimized={shouldBypassNextImageCache(imageSrc)}
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

            {/* Contenu textuel */}
            <div className="absolute bottom-0 left-0 p-6 w-full transform transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>

                {/* Description limitée à 3 lignes exactement */}
                <p className="text-sm text-gray-300 line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.description}
                </p>
            </div>
        </Link>
    );
};

export default function BentoGrid({ data, className }: { data: Courses[]; className?: string }) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-10 gap-4 ${className}`}>
            {data.map((item, i) => (
                <BentoItem key={i} item={item} index={i} />
            ))}
        </div>
    );
}
