import mongoose from "mongoose";

interface Logo {
    type: 'url' | 'text';
    url?: string;
    value?: string;
    alt?: string;
}

interface Description {
    text: string;
}

interface SocialMediaLink {
    platform: string;
    url: string;
    icon: string;
}

interface QuickLink {
    label: string;
    url: string;
}

interface HelpInfo {
    label: string;
    url: string;
}

interface ContactInfo {
    text: string;
    link?: string;
}

export interface IFooter extends Document{
    logo: Logo;
    description: Description;
    socialMediaLinks: SocialMediaLink[];
    quickLinks: QuickLink[];
    helpInfo: HelpInfo[];
    contactInfo: ContactInfo[];
}

interface TopBarItem{
        text: string;
        link?: string;
}

interface MenuItem {
    label: string;
    path: string;
}

interface ActionIcon {
    type: string;
    icon: string;
    route?: string;
}

interface Logo {
    type: 'url' | 'text';
    url?: string;
    value?: string;
    alt?: string;
}

export interface IHeader extends Document{
    topBar: TopBarItem[];
    menu: MenuItem[];
    actionIcons: ActionIcon[];
    logo: Logo;
}


interface SliderSection {
    title: string;
    shortDescription: string;
    link?: string;
    btnText?: string;
    backgroundImageUrl: string;
}

interface Category {
    name: string;
    description?: string;
    imageUrl: string;
    link: string;
}

interface BestItems {
    name: string;
    imageUrl: string;
    link: string;
    price: number;
}

interface CustomerReviews {
    customerName: string;
    reviewText: string;
    rating: number;
}

interface TrustBadge {
    icon: string;
    title: string;
    shortText: string;
}

interface displayImage {
    type: 'url' | 'text';
    url?: string;
    value?: string;
    alt?: string;
}

interface ItemsSequence {
    type: 'bestItems' | 'categories' | 'customerReviews' | 'trustBadges' | 'slider' | 'displayImage';
    order: number;
}

export interface IHomeContent extends Document {
    slider: SliderSection[];
    categories: Category[];
    bestItems: BestItems[];
    customerReviews: CustomerReviews[];
    trustBadges: TrustBadge[];
    displayImage: displayImage;
    itemsSequence?: ItemsSequence[];
}

export interface IUser {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    isVerified: boolean;
    otp?: string;
    otpExpires?: Date;
    role: 'user' | 'admin';
}

export interface IAddress extends Document {
    user: mongoose.Types.ObjectId;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phoneNumber: string;
    country: string;
    type: 'home' | 'work' | 'other';
    createdAt: Date;
    updatedAt: Date;
}