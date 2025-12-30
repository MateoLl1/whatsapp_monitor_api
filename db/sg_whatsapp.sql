--
-- PostgreSQL database dump
--

\restrict DZsKH5rXblDIudD1df6QfEUmVoViicweZzYT0yWZartsEtzigxUBlKyxOCV4dnk

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2025-12-30 09:58:28

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 41617)
-- Name: asesores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asesores (
    as_id integer NOT NULL,
    as_nombre character varying(20) NOT NULL,
    as_num_whatsapp character varying(20) NOT NULL,
    as_activo character varying
);


ALTER TABLE public.asesores OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 41624)
-- Name: conversaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversaciones (
    co_id integer NOT NULL,
    co_cliente_numero character varying(20) CONSTRAINT conversaciones_co_cliente_num_not_null NOT NULL,
    co_nom_cliente character varying(20),
    co_fe_inicio date NOT NULL,
    co_fe_fin date,
    co_estado character varying(20)
);


ALTER TABLE public.conversaciones OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 41632)
-- Name: mensajes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensajes (
    me_id integer NOT NULL,
    me_mensajes text NOT NULL,
    me_fecha date,
    me_from_me boolean NOT NULL
);


ALTER TABLE public.mensajes OWNER TO postgres;

--
-- TOC entry 5016 (class 0 OID 41617)
-- Dependencies: 219
-- Data for Name: asesores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asesores (as_id, as_nombre, as_num_whatsapp, as_activo) FROM stdin;
\.


--
-- TOC entry 5017 (class 0 OID 41624)
-- Dependencies: 220
-- Data for Name: conversaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversaciones (co_id, co_cliente_numero, co_nom_cliente, co_fe_inicio, co_fe_fin, co_estado) FROM stdin;
\.


--
-- TOC entry 5018 (class 0 OID 41632)
-- Dependencies: 221
-- Data for Name: mensajes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mensajes (me_id, me_mensajes, me_fecha, me_from_me) FROM stdin;
\.


--
-- TOC entry 4864 (class 2606 OID 41623)
-- Name: asesores asesores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asesores
    ADD CONSTRAINT asesores_pkey PRIMARY KEY (as_id);


--
-- TOC entry 4866 (class 2606 OID 41631)
-- Name: conversaciones conversaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones
    ADD CONSTRAINT conversaciones_pkey PRIMARY KEY (co_id);


--
-- TOC entry 4868 (class 2606 OID 41639)
-- Name: mensajes mensajes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_pkey PRIMARY KEY (me_id);


-- Completed on 2025-12-30 09:58:29

--
-- PostgreSQL database dump complete
--

\unrestrict DZsKH5rXblDIudD1df6QfEUmVoViicweZzYT0yWZartsEtzigxUBlKyxOCV4dnk

