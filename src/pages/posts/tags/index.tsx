import type { GetServerSidePropsContext } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@utils/trpc";
import useOnScreen from "@hooks/useOnScreen";
import ShouldRender from "@components/ShouldRender";
import MetaTags from "@components/MetaTags";
import { TagSection } from "@components/TagSection";
import SearchInput from "@components/SearchInput";
import EmptyMessage from "@components/EmptyMessage";
import { generateSSGHelper } from "@server/ssgHepers";

const AllTagsPage: React.FC = () => {
  const [queryValue, setQueryValue] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const {
    data: tagsWithPosts,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.useInfiniteQuery(
    [
      "posts.by-tags",
      {
        tagLimit: 6,
        query: queryValue,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  const dataToShow = useMemo(
    () => tagsWithPosts?.pages.flatMap((page) => page.tags),
    [tagsWithPosts]
  );
  const noDataToShow = !isLoading && !dataToShow?.length && !hasNextPage;

  const loadingArray = (length: number) => Array.from<undefined>({ length });

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <MetaTags title="All tags" />
      <div className="w-full">
        <h1 className="prose w-full text-left text-2xl font-bold dark:prose-invert xl:text-3xl">
          All tags
        </h1>
        <p className="-mb-3 text-zinc-600 dark:text-zinc-400">
          See all tags created on T3 blog.
        </p>
      </div>
      <SearchInput setQuery={setQueryValue} placeholder="Search tags" />
      {(isLoading ? loadingArray(4) : dataToShow)?.map((tag, key) => (
        <TagSection
          loading={isLoading}
          tag={tag}
          key={isLoading ? key : tag?.id}
        />
      ))}

      <ShouldRender if={isFetchingNextPage}>
        <TagSection loading />
      </ShouldRender>

      <ShouldRender if={!!queryValue && noDataToShow}>
        <EmptyMessage message="Hmm. Couldn't find any tags." hideRedirect />
      </ShouldRender>

      <div ref={bottomRef} />
    </>
  );
};

export default AllTagsPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, res } = context;

  const ssg = await generateSSGHelper(req, res);

  await ssg.prefetchInfiniteQuery("posts.by-tags", {
    tagLimit: 6,
    query: "",
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
}
