import { GetStaticProps } from "next";
import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";

import styles from "../styles/pages/home.module.scss";

interface HomeProps {
  product: {
    priceId: string;
    amount: string;
  };
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | leo.blog</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>
            👏 <strong>Hey, Welcome!</strong>
          </span>
          <h1>
            Become a master in the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} / month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>
        <img src="/assets/images/avatar.svg" alt="Girl Coding" />
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve("price_1KAy5wKZZeOI3HrG75qN8U2T", {
    expand: ["product"],
  });

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price.unit_amount / 100),
  };

  return {
    props: { product },
    revalidate: 60 * 60 * 24 * 7, // 7 days
  };
};
