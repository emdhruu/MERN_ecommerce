import mongoose, { Document, Schema } from "mongoose";

type role = 'user' | 'admin';

type addressType = 'home' | 'work' | 'other';

type PaymentMethod = 'credit_card' | 'paypal' | 'cash_on_delivery';

type PaymentStatus = 'pending' | 'completed' | 'failed';

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

type DiscountedBy = 'percentage' | 'fixed';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    isVerified: boolean;
    otp?: string;
    otpExpires?: Date;
    role: role;
}


export interface IAddress extends Document {
    user: mongoose.Types.ObjectId;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phoneNumber: string;
    country: string;
    type: addressType;
    createdAt: Date;
    updatedAt: Date;
}

export interface IWishList extends Document {
    user: mongoose.Types.ObjectId;
    products: mongoose.Types.ObjectId[];
    note?: string;
}

export interface IReview extends Document {
    product: mongoose.Types.ObjectId;
    user?: mongoose.Types.ObjectId;
    rating: number;
    comment: string[];
}

export interface IProduct extends Document {
    name: string;
    description: string;
    price: mongoose.Types.Decimal128;
    salesPrice?: mongoose.Types.Decimal128;
    discountPercentage: number;
    category: mongoose.Types.ObjectId;
    brand: mongoose.Types.ObjectId;
    inStock: boolean;
    images: string[];
    thumbnail?: string;
    stock: number;
    isFeatured: boolean;
    isDeleted: boolean;
    averageRating: number;
}


export interface IOrderItem extends Document {
    product: Schema.Types.ObjectId;
    quantity: number;
}


export interface IOrder extends Document {
    user: Schema.Types.ObjectId;
    items: IOrderItem[];
    address: Schema.Types.ObjectId;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    totalAmount: mongoose.Types.Decimal128;
    orderStatus: OrderStatus;
}

interface ICartItem  {
    product: mongoose.Types.ObjectId;
    quantity: number;
}

export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
}

export interface IBrand extends Document {
    name: string;
    slug: string;
    logoUrl?: string;
    isActive: boolean;
}

export interface ICategory extends Document {
    name: string;
    slug: string;
    description: string;
    imageUrl? : string;
    isActive: boolean;
}

interface ICouponUsedBy {
    userId: mongoose.Types.ObjectId;
    usedAt: Date;
}

export interface ICoupon extends Document {
    code: string;
    discountType: DiscountedBy;
    discountValue: number;
    description?: string;
    minPurchaseAmount?: mongoose.Types.Decimal128;
    maxDiscount?: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
    usageLimit?: number;
    usedBy?: ICouponUsedBy[];
    applicableCategories?: mongoose.Types.ObjectId[];
    applicableProducts?: mongoose.Types.ObjectId[];
    userLimit?: number;
}