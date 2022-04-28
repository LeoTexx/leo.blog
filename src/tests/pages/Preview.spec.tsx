import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import Post, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post = {
  slug: "my-new-post",
  title: "My New Post",
  content: "<p>Hello Everybody</p>",
  updatedAt: "March, 15",
};

jest.mock("../../services/prismic");
jest.mock("next-auth/react");
jest.mock("next/router");

describe("Preview page", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
    });

    render(<Post post={post} />);
    expect(screen.getByText("My New Post")).toBeInTheDocument();
    expect(screen.getByText("Hello Everybody")).toBeInTheDocument();
    expect(screen.getByText("Wanna Continue Reading?")).toBeInTheDocument();
  });

  it("redirects user to full post when user has active subscription", () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce({
      data: {
        activeSubscription: "fake-active-subscription",
      },
    } as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<Post post={post} />);
    expect(pushMock).toHaveBeenCalledWith("/posts/my-new-post");
  });

  it("loads initial data", async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            {
              type: "heading",
              text: "My New Post",
            },
          ],
          content: [
            {
              type: "paragraph",
              text: "Hello world, jest is testing my blog",
            },
          ],
        },
        last_publication_date: "04-01-2022",
      }),
    } as any);

    const response = await getStaticProps({
      params: { slug: "my-new-post" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "my-new-post",
            title: "My New Post",
            content: "<p>Hello world, jest is testing my blog</p>",
            updatedAt: "April 01, 2022",
          },
        },
      })
    );
  });
});
