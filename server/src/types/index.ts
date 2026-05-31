export interface Member {
    mem_id: number;
    mem_name: string;
    mem_phone: string | null;
    mem_email: string | null;
}

export interface Membership {
    membership_id: number;
    member_id: number;
    status: string;
}

export interface Collection {
    collection_id: number;
    collection_name: string;
}

export interface Category {
    cat_id: number;
    cat_name: string;
    sub_cat_name: string | null;
}

export interface Book {
    book_id: number;
    book_name: string;
    author: string;
    book_cat_id: number | null;
    book_collection_id: number | null;
    book_launch_date: Date | null;
    book_publisher: string | null;
}

export interface BookDetail extends Book {
    category: Category | null;
    collection: Collection | null;
    active_issuances: number;
}

export interface Issuance {
    issuance_id: number;
    book_id: number;
    issuance_member: number;
    issued_by: string | null;
    issuance_date: Date;
    target_return_date: Date;
    issuance_status: 'active' | 'returned' | 'overdue';
}

export interface IssuanceDetail extends Issuance {
    book: Book | null;
    member: Member | null;
}
