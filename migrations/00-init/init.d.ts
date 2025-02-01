export type Product = {
    entity_id: string;
    entity_type_id: string;
    attribute_set_id: string;
    type_id: string;
    sku: string;
    created_at: string;
    updated_at: string;
    has_options: string;
    required_options: string;
    status: string;
    visibility: string;
    tax_class_id: string;
    enable_googlecheckout: string;
    backstage_pass_only: string;
    has_related_products: string;
    xd_fix_morphs: string;
    exclusive_at: string | null;
    links_purchased_separately: string;
    links_exist: string;
    name: string;
    url_key: string;
    msrp_enabled: string;
    msrp_display_actual_price_type: string;
    meta_title: string | null;
    meta_description: string | null;
    image: string;
    small_image: string;
    thumbnail: string;
    custom_design: string | null;
    page_layout: string | null;
    options_container: string;
    figure: string | null;
    daz_studio_version: string;
    poser_version: string;
    requires: string;
    full_body_morphs: string | null;
    brokerage_product_id: string | null;
    samples_title: string;
    links_title: string;
    gift_message_available: string | null;
    url_path: string;
    image_label: string | null;
    small_image_label: string | null;
    thumbnail_label: string | null;
    news_from_date: string;
    news_to_date: string;
    special_from_date: string | null;
    special_to_date: string | null;
    custom_design_from: string | null;
    custom_design_to: string | null;
    description: string;
    short_description: string;
    meta_keyword: string | null;
    custom_layout_update: string | null;
    readme: string | null;
    price: string;
    special_price: string | null;
    msrp: string | null;
    is_salable: string;
    stock_item: Record<string, unknown>;
    images: Array<{
        value_id: string;
        file: string;
        label: string;
        position: string;
        disabled: string;
        label_default: string;
        position_default: string;
        disabled_default: string;
        url: string;
        id: string;
        path: string;
    }>;
    downloadable_links?: {
        link_id: string;
        product_id: string;
        sort_order: string;
        number_of_downloads: string;
        is_shareable: string;
        link_url: string;
        link_file: string;
        link_type: string;
        sample_url: string;
        sample_file: string;
        sample_type: string;        
    }[];
    categories: {
        id: string;
        name: string;
        url_key: string;
        path: string;
    }[];
    related_products: Array<{
        link_id: string;
        product_id: string;
        linked_product_id: string;
        link_type_id: string;
    }>;

};

export type Customer = {
    entity_id: string;
    entity_type_id: string;
    attribute_set_id: string;
    website_id: string;
    email: string;
    group_id: string;
    increment_id: string;
    store_id: string;
    created_at: string;
    updated_at: string;
    is_active: string;
    disable_auto_group_change: string;
    prefix: string;
    firstname: string;
    lastname: string;
    suffix: string;
    password_hash: string;
    middlename: string;
    orders: Array<{
        entity_id: string;
        status: string;
        coupon_code: string;
        discount_amount: string;
        grand_total: string;
        subtotal: string;
        created_at: string;
        items: string[];
    }>;
    wishlist: Array<{
        wishlist_item_id: string;
        wishlist_id: string;
        product_id: string;
        store_id: string;
        added_at: string;
        description: string | null;
        qty: string;
        product: {

        };
        product_name: string;
        name: string;
        price: string;
    }>,
}
