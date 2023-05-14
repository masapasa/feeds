import { trpc } from "@utils/trpc";
import debounce from "lodash.debounce";
import { useFormContext } from "react-hook-form";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import unescape from "lodash.unescape";
import Field from "./Field";
import isURL from "validator/lib/isURL";
import ShouldRender from "./ShouldRender";
import type { CreatePostInput, UpdatePostInput } from "@schema/post.schema";
import LinkPreview from "./LinkPreview";
import type { Link as LinkType } from "@prisma/client";
import { baseUrl } from "@utils/constants";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import TextInput from "./TextInput";

type Props = {
  initialLink?: LinkType | null;
};

const LinkInput: React.FC<Props> = ({ initialLink }) => {
  const [animateRef] = useAutoAnimate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const { setValue, formState } = useFormContext<
    CreatePostInput | UpdatePostInput
  >();
  const formError = formState.errors.link;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newLink = e.target.value;
    const isValidLink = isURL(newLink);

    // User clearing up input: should clear form and link value.
    if (newLink === "") {
      setValue("link", undefined, { shouldValidate: true });
      return setLink(newLink);
    }

    if (isValidLink) {
      return setLink(newLink);
    }

    // Invalid link: should clear input, form value & link value.
    if (!isValidLink) {
      toast.error("Invalid link");
      setValue("link", undefined, { shouldValidate: true });
      setLink("");
      if (inputRef?.current) inputRef.current.value = "";
    }
  };

  const onChange = debounce(handleChange, 500);

  const {
    data: metadata,
    error,
    isLoading,
  } = trpc.useQuery(["scraper.scrape-link", { url: link }], {
    refetchOnWindowFocus: false,
    enabled: !!link,
    onSettled: (data, error) => {
      if (error || !data?.url) {
        setValue("link", undefined, { shouldValidate: true });
      }

      if (data?.url) {
        const dataToSend = {
          image: data?.image || `${baseUrl}/static/default.jpg`,
          title: data?.title || "Shared link",
          url: data.url,
          description: data?.description
            ? unescape(data?.description)
            : "Link shared on T3 blog.",
          ...(data?.publisher && {
            publisher: data?.publisher,
          }),
        };

        setValue("link", dataToSend, { shouldValidate: true });
      }
    },
  });

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (initialLink) {
      setValue("link", initialLink, { shouldValidate: true });
      setLink(initialLink?.url);
      if (inputRef?.current) inputRef.current.value = initialLink?.url;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLink]);

  return (
    <div ref={animateRef} className="flex w-full flex-col gap-3">
      <Field
        label="Link"
        description="By adding a link to your post, the link will be highlighted on the post."
        error={formError as any}
      >
        <TextInput
          variant="primary"
          sizeVariant="lg"
          ref={inputRef}
          type="text"
          className="rounded-md"
          loading={isLoading}
          onChange={onChange}
          placeholder="Paste your link"
        />
      </Field>
      <ShouldRender if={!!metadata || isLoading}>
        <LinkPreview loading={isLoading} data={metadata} />
      </ShouldRender>
    </div>
  );
};

export default LinkInput;
