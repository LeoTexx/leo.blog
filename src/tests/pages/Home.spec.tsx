import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";

import Home, { getStaticProps } from "../../pages/index";
import { stripe } from "../../services/stripe";

jest.mock("next/router");
jest.mock("next-auth/react", () => {
  return {
    useSession() {
      return { data: null, status: "unauthenticated" };
    },
  };
});
jest.mock("../../services/stripe");

describe("Home page", () => {
  it("renders correctly", () => {
    render(<Home product={{ priceId: "fake-priceId", amount: "€10,00" }} />);
    expect(screen.getByText(/€10,00/)).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const retrieveStripePricesMocked = mocked(stripe.prices.retrieve);

    retrieveStripePricesMocked.mockResolvedValueOnce({
      id: "fake-priceId",
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: { product: { amount: "10,00\xa0€", priceId: "fake-priceId" } },
      })
    );
  });
});
