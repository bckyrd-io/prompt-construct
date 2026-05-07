--
-- PostgreSQL database dump
--

\restrict Nscz1mMGejnJYeFXXw6NfgCe86jRIqYXq6sSjhzseX65UckTRalH5PUcfWvWBzu

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

-- Started on 2026-04-29 04:42:11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 17303)
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- TOC entry 5230 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 25555)
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    user_id integer,
    property_id integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    step integer DEFAULT 1,
    first_name character varying(255),
    last_name character varying(255),
    phone character varying(50),
    address text,
    city character varying(100),
    state character varying(50),
    zip character varying(20),
    employment character varying(100),
    income integer,
    down_payment integer,
    uploaded_documents text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT applications_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 25554)
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO postgres;

--
-- TOC entry 5231 (class 0 OID 0)
-- Dependencies: 224
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- TOC entry 221 (class 1259 OID 25519)
-- Name: milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.milestones (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.milestones OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 25518)
-- Name: milestones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.milestones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.milestones_id_seq OWNER TO postgres;

--
-- TOC entry 5232 (class 0 OID 0)
-- Dependencies: 220
-- Name: milestones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.milestones_id_seq OWNED BY public.milestones.id;


--
-- TOC entry 228 (class 1259 OID 49951)
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    tx_ref character varying(255) NOT NULL,
    milestone_id character varying(50),
    property_id integer,
    amount numeric(15,2),
    milestone_name text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '01:00:00'::interval)
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25579)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    user_id integer,
    application_id integer,
    amount integer NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    provider_ref character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 25578)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 226
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- TOC entry 219 (class 1259 OID 25496)
-- Name: properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.properties (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    price integer NOT NULL,
    type character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'available'::character varying,
    image_url text,
    client_id integer,
    progress integer DEFAULT 0,
    beds integer DEFAULT 0,
    baths numeric(3,1) DEFAULT 0,
    sqft integer DEFAULT 0,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    embedding public.vector(3072),
    CONSTRAINT properties_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT properties_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'available'::character varying, 'pending'::character varying, 'completed'::character varying, 'acquired'::character varying, 'payment_in_progress'::character varying])::text[])))
);


ALTER TABLE public.properties OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 25495)
-- Name: properties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.properties_id_seq OWNER TO postgres;

--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 218
-- Name: properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- TOC entry 223 (class 1259 OID 25528)
-- Name: property_milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.property_milestones (
    id integer NOT NULL,
    property_id integer NOT NULL,
    milestone_id integer,
    name character varying(255) NOT NULL,
    completed boolean DEFAULT false,
    current boolean DEFAULT false,
    payment_status character varying(50) DEFAULT 'unpaid'::character varying,
    amount integer DEFAULT 0,
    due_date date,
    photos text[],
    ai_note text,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT property_milestones_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['paid'::character varying, 'due'::character varying, 'unpaid'::character varying])::text[])))
);


ALTER TABLE public.property_milestones OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 25527)
-- Name: property_milestones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.property_milestones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_milestones_id_seq OWNER TO postgres;

--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 222
-- Name: property_milestones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.property_milestones_id_seq OWNED BY public.property_milestones.id;


--
-- TOC entry 217 (class 1259 OID 25480)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'client'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Pending'::character varying, 'Inactive'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 25479)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 216
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 5028 (class 2604 OID 25558)
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- TOC entry 5017 (class 2604 OID 25522)
-- Name: milestones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milestones ALTER COLUMN id SET DEFAULT nextval('public.milestones_id_seq'::regclass);


--
-- TOC entry 5033 (class 2604 OID 25582)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 5009 (class 2604 OID 25499)
-- Name: properties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- TOC entry 5020 (class 2604 OID 25531)
-- Name: property_milestones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_milestones ALTER COLUMN id SET DEFAULT nextval('public.property_milestones_id_seq'::regclass);


--
-- TOC entry 5005 (class 2604 OID 25483)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5221 (class 0 OID 25555)
-- Dependencies: 225
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, user_id, property_id, status, step, first_name, last_name, phone, address, city, state, zip, employment, income, down_payment, uploaded_documents, created_at, updated_at) FROM stdin;
1	2	7	pending	1	\N	\N	\N	\N	\N	\N	\N	business	2000000	500000	\N	2026-04-21 00:34:00.500715	2026-04-21 00:34:00.500715
35	2	2	pending	1	\N	\N	\N	\N	\N	\N	\N	business	434434	454345	\N	2026-04-21 01:22:36.208403	2026-04-21 01:22:36.208403
2	2	40	approved	1	\N	\N	\N	\N	\N	\N	\N	business	10000000	12000000	\N	2026-04-21 01:14:10.396376	2026-04-21 01:35:21.673711
\.


--
-- TOC entry 5217 (class 0 OID 25519)
-- Dependencies: 221
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.milestones (id, name, display_order, created_at) FROM stdin;
1	Site Clearing	1	2026-04-20 08:29:38.703747
2	Foundation	2	2026-04-20 08:29:38.703747
3	Framing	3	2026-04-20 08:29:38.703747
4	Roofing	4	2026-04-20 08:29:38.703747
5	Interior	5	2026-04-20 08:29:38.703747
6	Inspection	6	2026-04-20 08:29:38.703747
7	Handover	7	2026-04-20 08:29:38.703747
8	Site Clearing	1	2026-04-20 07:59:10.730769
9	Foundation	2	2026-04-20 07:59:10.730769
10	Framing	3	2026-04-20 07:59:10.730769
11	Roofing	4	2026-04-20 07:59:10.730769
12	Interior	5	2026-04-20 07:59:10.730769
13	Inspection	6	2026-04-20 07:59:10.730769
14	Handover	7	2026-04-20 07:59:10.730769
15	Site Clearing	1	2026-04-20 07:33:05.596651
16	Foundation	2	2026-04-20 07:33:05.596651
17	Framing	3	2026-04-20 07:33:05.596651
18	Roofing	4	2026-04-20 07:33:05.596651
19	Interior	5	2026-04-20 07:33:05.596651
20	Inspection	6	2026-04-20 07:33:05.596651
21	Handover	7	2026-04-20 07:33:05.596651
22	Site Clearing	1	2026-04-20 07:49:42.654097
23	Foundation	2	2026-04-20 07:49:42.654097
24	Framing	3	2026-04-20 07:49:42.654097
25	Roofing	4	2026-04-20 07:49:42.654097
26	Interior	5	2026-04-20 07:49:42.654097
27	Inspection	6	2026-04-20 07:49:42.654097
28	Handover	7	2026-04-20 07:49:42.654097
48	Site Clearing	1	2026-04-21 01:01:18.986613
49	Foundation	2	2026-04-21 01:01:18.986613
50	Framing	3	2026-04-21 01:01:18.986613
51	Roofing	4	2026-04-21 01:01:18.986613
52	Interior	5	2026-04-21 01:01:18.986613
53	Inspection	6	2026-04-21 01:01:18.986613
54	Handover	7	2026-04-21 01:01:18.986613
55	Site Clearing	1	2026-04-21 00:37:46.551455
56	Foundation	2	2026-04-21 00:37:46.551455
57	Framing	3	2026-04-21 00:37:46.551455
58	Roofing	4	2026-04-21 00:37:46.551455
59	Interior	5	2026-04-21 00:37:46.551455
60	Inspection	6	2026-04-21 00:37:46.551455
61	Handover	7	2026-04-21 00:37:46.551455
88	Site Clearing	1	2026-04-21 01:25:58.936314
89	Foundation	2	2026-04-21 01:25:58.936314
90	Framing	3	2026-04-21 01:25:58.936314
91	Roofing	4	2026-04-21 01:25:58.936314
92	Interior	5	2026-04-21 01:25:58.936314
93	Inspection	6	2026-04-21 01:25:58.936314
94	Handover	7	2026-04-21 01:25:58.936314
\.


--
-- TOC entry 5224 (class 0 OID 49951)
-- Dependencies: 228
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (tx_ref, milestone_id, property_id, amount, milestone_name, created_at, expires_at) FROM stdin;
\.


--
-- TOC entry 5223 (class 0 OID 25579)
-- Dependencies: 227
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, user_id, application_id, amount, status, provider_ref, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5215 (class 0 OID 25496)
-- Dependencies: 219
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.properties (id, name, location, price, type, status, image_url, client_id, progress, beds, baths, sqft, description, created_at, updated_at, embedding) FROM stdin;
4	Coastal Haven	Miami, FL	1850000	Waterfront	active	/uploads/image.jpg	2	0	4	3.5	3800	An exquisite waterfront property in Miami's exclusive Coconut Grove area. This 4-bedroom Mediterranean-style home features direct ocean access, a private dock, and stunning water views from every room. The interior includes a chef's kitchen, formal dining room, and a master suite with a spa-like bathroom. Outdoor amenities include a heated infinity pool, outdoor kitchen, and lush tropical landscaping. Located near top-rated schools, marinas, and vibrant dining scene.	2024-02-15 11:00:00	2026-04-21 01:27:03.972565	\N
7	mpatsa farms	Khonjeni	30000	Land	available	/uploads/1776698879644-farm_dam.jpg	\N	0	2	3.0	4000	this farm currently has big dam for irrigation already	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295	\N
1	The Highlands Estate	Austin, TX	1200000	Residential	active	/uploads/image.jpg	2	65	4	3.5	3200	A stunning hillside estate in Austin featuring panoramic views of the Texas Hill Country. This modern 4-bedroom home boasts an open-concept design with floor-to-ceiling windows, a gourmet kitchen with high-end appliances, and a spacious master suite with a private balcony. The property includes a landscaped backyard with a saltwater pool and outdoor entertaining area. Located in a prestigious neighborhood with excellent schools and easy access to downtown Austin.	2024-01-20 10:00:00	2026-04-20 08:29:38.703747	\N
40	airpot	luchenza	27000000	Commercial	payment_in_progress	/uploads/1776758471872-airport.jpg	2	100	0	0.0	10000	this land had an air port for the city	2026-04-21 01:01:13.904421	2026-04-21 01:35:21.673711	\N
3	Rocky Mountain Estate	Khonjeni	90000	Land	available	/uploads/image.jpg	\N	0	5	4.0	4500	A pristine 5-acre parcel of land nestled in the Rocky Mountains just 30 minutes from Denver. This elevated lot offers breathtaking views of the continental divide and direct access to hiking trails. The property features mature pine trees, a natural spring, and building sites approved for a custom 5-bedroom mountain retreat. Perfect for those seeking privacy and outdoor recreation while maintaining proximity to urban amenities. Ideal for building a luxury vacation home or permanent residence.	2024-03-01 09:00:00	2026-04-20 08:29:38.703747	\N
2	Urban Loft Project	Seattle, WA	850000	Residential	available	/uploads/image.jpg	\N	14	2	2.0	1800	A contemporary urban loft in the heart of Seattle's Capitol Hill district. This 2-bedroom industrial-style residence features exposed brick walls, polished concrete floors, and soaring 14-foot ceilings. The open floor plan seamlessly connects the living area to a modern kitchen with quartz countertops. Building amenities include a rooftop deck with city views, fitness center, and secure parking. Walking distance to trendy restaurants, coffee shops, and light rail transit.	2024-02-10 14:00:00	2026-04-21 01:24:22.041876	\N
6	Desert Springs Villa	Phoenix, AZ	950000	Residential	completed	/uploads/image.jpg	2	100	3	2.5	2400	A charming desert-inspired villa in Phoenix's Arcadia neighborhood. This 3-bedroom home features an open floor plan with a modern kitchen, spacious living areas, and a covered patio perfect for Arizona living. The property includes a desert landscaping with native plants, a sparkling pool, and mountain views. Located near hiking trails, golf courses, and the Biltmore Fashion Park. Energy-efficient design with solar panels and smart home technology.	2023-11-15 08:30:00	2026-04-20 08:29:38.703747	\N
\.


--
-- TOC entry 5219 (class 0 OID 25528)
-- Dependencies: 223
-- Data for Name: property_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_milestones (id, property_id, milestone_id, name, completed, current, payment_status, amount, due_date, photos, ai_note, display_order, created_at, updated_at) FROM stdin;
1	1	1	Site Clearing	t	f	paid	75000	\N	\N	\N	1	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
2	1	2	Foundation	t	f	paid	85000	\N	\N	\N	2	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
3	1	3	Framing	t	f	paid	90000	\N	\N	\N	3	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
4	1	4	Roofing	f	t	due	65000	\N	\N	\N	4	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
5	1	5	Interior	f	f	unpaid	120000	\N	\N	\N	5	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
6	1	6	Inspection	f	f	unpaid	25000	\N	\N	\N	6	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
7	1	7	Handover	f	f	unpaid	50000	\N	\N	\N	7	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
15	6	1	Site Clearing	t	f	paid	60000	\N	\N	\N	1	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
16	6	2	Foundation	t	f	paid	70000	\N	\N	\N	2	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
17	6	3	Framing	t	f	paid	75000	\N	\N	\N	3	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
18	6	4	Roofing	t	f	paid	55000	\N	\N	\N	4	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
19	6	5	Interior	t	f	paid	100000	\N	\N	\N	5	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
20	6	6	Inspection	t	f	paid	20000	\N	\N	\N	6	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
21	6	7	Handover	t	f	paid	40000	\N	\N	\N	7	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
23	2	2	Foundation	f	f	unpaid	60000	\N	\N	\N	2	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
24	2	3	Framing	f	f	unpaid	70000	\N	\N	\N	3	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
25	2	4	Roofing	f	f	unpaid	50000	\N	\N	\N	4	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
26	2	5	Interior	f	f	unpaid	90000	\N	\N	\N	5	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
27	2	6	Inspection	f	f	unpaid	15000	\N	\N	\N	6	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
28	2	7	Handover	f	f	unpaid	30000	\N	\N	\N	7	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
29	3	1	Site Clearing	f	f	unpaid	100000	\N	\N	\N	1	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
30	3	2	Foundation	f	f	unpaid	120000	\N	\N	\N	2	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
31	3	3	Framing	f	f	unpaid	130000	\N	\N	\N	3	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
32	3	4	Roofing	f	f	unpaid	100000	\N	\N	\N	4	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
33	3	5	Interior	f	f	unpaid	180000	\N	\N	\N	5	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
34	3	6	Inspection	f	f	unpaid	30000	\N	\N	\N	6	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
35	3	7	Handover	f	f	unpaid	60000	\N	\N	\N	7	2026-04-20 08:29:38.703747	2026-04-20 08:29:38.703747
43	7	1	Site Clearing	f	f	unpaid	0	\N	\N	\N	1	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
44	7	8	Site Clearing	f	f	unpaid	0	\N	\N	\N	1	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
45	7	2	Foundation	f	f	unpaid	0	\N	\N	\N	2	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
46	7	9	Foundation	f	f	unpaid	0	\N	\N	\N	2	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
47	7	3	Framing	f	f	unpaid	0	\N	\N	\N	3	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
48	7	10	Framing	f	f	unpaid	0	\N	\N	\N	3	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
49	7	4	Roofing	f	f	unpaid	0	\N	\N	\N	4	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
50	7	11	Roofing	f	f	unpaid	0	\N	\N	\N	4	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
51	7	5	Interior	f	f	unpaid	0	\N	\N	\N	5	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
52	7	12	Interior	f	f	unpaid	0	\N	\N	\N	5	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
53	7	6	Inspection	f	f	unpaid	0	\N	\N	\N	6	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
54	7	13	Inspection	f	f	unpaid	0	\N	\N	\N	6	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
55	7	7	Handover	f	f	unpaid	0	\N	\N	\N	7	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
56	7	14	Handover	f	f	unpaid	0	\N	\N	\N	7	2026-04-20 08:28:05.003295	2026-04-20 08:28:05.003295
104	40	\N	bid	t	f	paid	3999	\N	{/uploads/1776757753920-48bf1b27-69a1-4f5a-b0ad-dc673988c921.png}	\N	1	2026-04-21 00:49:19.708759	2026-04-21 00:24:10.35541
22	2	1	Site Clearing	t	f	paid	50000	\N	\N	\N	1	2026-04-20 08:29:38.703747	2026-04-21 01:24:22.041876
\.


--
-- TOC entry 5213 (class 0 OID 25480)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, status, created_at, updated_at) FROM stdin;
1	Admin User	admin@prompt.construct	password123	admin	Active	2024-01-01 10:00:00	2026-04-20 08:29:38.703747
2	Adam Smith	adam@prompt.construct	password123	client	Active	2024-01-15 09:00:00	2026-04-20 08:29:38.703747
\.


--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 224
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_id_seq', 35, true);


--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 220
-- Name: milestones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.milestones_id_seq', 94, true);


--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 226
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 218
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.properties_id_seq', 40, true);


--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 222
-- Name: property_milestones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.property_milestones_id_seq', 136, true);


--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 216
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 5057 (class 2606 OID 25567)
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- TOC entry 5053 (class 2606 OID 25526)
-- Name: milestones milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 49959)
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (tx_ref);


--
-- TOC entry 5059 (class 2606 OID 25588)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5051 (class 2606 OID 25512)
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- TOC entry 5055 (class 2606 OID 25543)
-- Name: property_milestones property_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_milestones
    ADD CONSTRAINT property_milestones_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 25494)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5049 (class 2606 OID 25492)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 25573)
-- Name: applications applications_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- TOC entry 5066 (class 2606 OID 25568)
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5067 (class 2606 OID 25594)
-- Name: payments payments_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE SET NULL;


--
-- TOC entry 5068 (class 2606 OID 25589)
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5062 (class 2606 OID 25513)
-- Name: properties properties_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5063 (class 2606 OID 25549)
-- Name: property_milestones property_milestones_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_milestones
    ADD CONSTRAINT property_milestones_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.milestones(id) ON DELETE SET NULL;


--
-- TOC entry 5064 (class 2606 OID 25544)
-- Name: property_milestones property_milestones_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_milestones
    ADD CONSTRAINT property_milestones_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


-- Completed on 2026-04-29 04:42:11

--
-- PostgreSQL database dump complete
--

\unrestrict Nscz1mMGejnJYeFXXw6NfgCe86jRIqYXq6sSjhzseX65UckTRalH5PUcfWvWBzu

