// components/PageTitle.tsx

import { useEffect } from "react";

type PageTitleProps = {
	title: string;
};

export default function PageTitle({ title }: PageTitleProps) {
	useEffect(() => {
		document.title = `همکار | ${title}`;
	}, [title]);

	return null;
}