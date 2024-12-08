'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
     return queryInterface.sequelize.query(
      `create extension if not exists "fuzzystrmatch"
      
      CREATE OR REPLACE FUNCTION public."search"(p_search_criteria varchar, p_location varchar)
      RETURNS TABLE ( store_id  int,
                      monday_open  time,
                      monday_closed  time,
                      tuesday_open  time,
                      tuesday_closed  time,
                      wednesday_open  time,
                      wednesday_closed  time,
                      thursday_open  time,
                      thursday_closed  time,
                      friday_open  time,
                      friday_closed  time,
                      saturday_open  time,
                      saturday_closed  time,
                      sunday_open  time,
                      sunday_closed  int,
                      unique_name  varchar,
                      email  text,
                      phone  varchar,
                      phone_2  varchar,
                      phone_3  varchar,
                      address_line_1  varchar,
                      address_line_2  varchar,
                      latitude  real,
                      longitude  real,
                      country  varchar,
                      city  varchar,
                      state  varchar,
                      postal_code  varchar,
                      is_primary  bool,
                      temp_or_perm_closure  bpchar,
                      reopen_date  date,
                      store_insert_date  timestamp,
                      store_update_date  timestamp,
                      store_deleted_date  timestamp,
                      business_id  int,
                      avg_star_rating  numeric,
                      review_count  bigint,
                      created_by  int,
                      business_name  varchar,
                      description  text,
                      profile_banner_url  text,
                      profile_pic_url  text,
                      active  bool,
                      category  varchar,
                      business_deleted_date timestamp,
                      business_insert_date timestamp,
                      business_update_date timestamp,
                      tag  varchar,
                      product_id int,
                      product_name varchar,               
                      product_key varchar,
                      product_type varchar,
                      product_tag text,
                      image_url text,
                      product_description varchar,
                      product_update_date timestamp,
                      product_insert_date timestamp)
      LANGUAGE plpgsql AS
    $func$
    #variable_conflict use_column
    BEGIN
       RETURN QUERY
          with 
            stores as (
              select  
                    bs.id store_id
                  , bs.unique_name
                  , bs.email
                  , bs.phone
                  , bs.phone_2 
                  , bs.phone_3
                  , bs.address_line_1
                  , bs.address_line_2
                  , bs.latitude
                  , bs.longitude
                  , bs.country
                  , bs.city
                  , bs.state
                  , bs.postal_code
                  , bs.is_primary
                  , bs.temp_or_perm_closure
                  , bs.reopen_date
                  , bs.insert_date   store_insert_date 
                  , bs.update_date   store_update_date 
                  , bs.deleted_date  store_deleted_date
                  , bs.business_id
                  , round(avg(r.rating_number),1) avg_star_rating
                  , count(r.rating_number) review_count
              from    
                    business_store bs    
                      left join
                        review r
                          on r.store_id = bs.id 
              where
                    bs.city = p_location
              and
                    bs.temp_or_perm_closure is null
              group by bs.id
            ), 
            business as (
              select
                    b.id business_id
                  , b.created_by
                  , b.business_name
                  , b.description
                  , b.profile_banner_url
                  , b.profile_pic_url
                  , b.active
                  , b.category
                  , b.deleted_date business_deleted_date
                  , b.insert_date business_insert_date
                  , b.update_date business_update_date
                  , bt.tag
                  , p.id  product_id
                  , p.product_name               
                  , p.product_key
                  , p.product_type
                  , p.tag product_tag
                  , p.image_url
                  , p.description product_description
                  , p.update_date product_update_date
                  , p.insert_date product_insert_date
              from
                    business b
                      left join 
                        business_tags bt
                          on b.id = bt.business_id  
                      left join
                        product p
                          on b.id = p.business_id
              where 
                    (
                      METAPHONE("business_name",10) like CONCAT('%', METAPHONE(p_search_criteria, 10), '%')
                    or 
                      METAPHONE("category",10) like CONCAT('%', METAPHONE(p_search_criteria, 10), '%')
                    or
                      METAPHONE("product_name",10) like CONCAT('%', METAPHONE(p_search_criteria, 10), '%')
                    )        
              and 
                    deleted_date is null
            ),
           store_details as (
              select
                    bsh.business_store_id
                  , bsh.monday_open
                  , bsh.monday_closed
                  , bsh.tuesday_open
                  , bsh.tuesday_closed
                  , bsh.wednesday_open
                  , bsh.wednesday_closed
                  , bsh.thursday_open
                  , bsh.thursday_closed
                  , bsh.friday_open
                  , bsh.friday_closed
                  , bsh.saturday_open
                  , bsh.saturday_closed
                  , bsh.sunday_open
                  , bsh.sunday_closed
                  , s.store_id
                  , s.unique_name
                  , s.email
                  , s.phone
                  , s.phone_2 
                  , s.phone_3
                  , s.address_line_1
                  , s.address_line_2
                  , s.latitude
                  , s.longitude
                  , s.country
                  , s.city
                  , s.state
                  , s.postal_code
                  , s.is_primary
                  , s.temp_or_perm_closure
                  , s.reopen_date
                  , s.store_insert_date 
                  , s.store_update_date 
                  , s.store_deleted_date
                  , s.business_id
                  , s.avg_star_rating
                  , s.review_count
                from
                    stores s
                      left join 
                        business_store_hours bsh
                          on bsh.business_store_id = s.store_id 
          ),
            store_full_details as (
              select
                    sh.store_id
                  , sh.monday_open
                  , sh.monday_closed
                  , sh.tuesday_open
                  , sh.tuesday_closed
                  , sh.wednesday_open
                  , sh.wednesday_closed
                  , sh.thursday_open
                  , sh.thursday_closed
                  , sh.friday_open
                  , sh.friday_closed
                  , sh.saturday_open
                  , sh.saturday_closed
                  , sh.sunday_open
                  , sh.sunday_closed
                  , sh.unique_name
                  , sh.email
                  , sh.phone
                  , sh.phone_2 
                  , sh.phone_3
                  , sh.address_line_1
                  , sh.address_line_2
                  , sh.latitude
                  , sh.longitude
                  , sh.country
                  , sh.city
                  , sh.state
                  , sh.postal_code
                  , sh.is_primary
                  , sh.temp_or_perm_closure
                  , sh.reopen_date
                  , sh.store_insert_date 
                  , sh.store_update_date 
                  , sh.store_deleted_date
                  , sh.business_id
                  , sh.avg_star_rating
                  , sh.review_count
                  , bs.created_by
                  , bs.business_name
                  , bs.description
                  , bs.profile_banner_url
                  , bs.profile_pic_url
                  , bs.active
                  , bs.category
                  , bs.business_deleted_date
                  , bs.business_insert_date
                  , bs.business_update_date
                  , bs.tag
                  , bs.product_id
                  , bs.product_name               
                  , bs.product_key
                  , bs.product_type
                  , bs.product_tag
                  , bs.image_url
                  , bs.product_description
                  , bs.product_update_date
                  , bs.product_insert_date              
              from
                 store_details sh
                    left join 
                      business bs 
                        on sh.store_id = bs.business_id
            )
          select
                *
          from    
                store_full_details  s;                 
    END
    $func$;       
    `)
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`
      drop extension if not exists "fuzzystrmatch";
      drop function public."search"(varchar, varchar);`)
  }
};
