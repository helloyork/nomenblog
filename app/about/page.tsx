
import Title from "@/app/_lib/elements/title";
import clsx from "clsx";


export default function Page() {
    return (
        <>
            <Title title="Nomen" subtitle="Front-end, NodeJS library, Serverless back-end developer" />
            <div className={clsx(
                "text-left px-4 sm:px-6 md:px-8",
                "flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-8",
            )}>
                <div className="w-full lg:w-1/2">
                    <p className={clsx(
                        "dark:text-white text-xl sm:text-2xl font-light mt-4 sm:mt-6 break-words text-overflow-safe",
                    )}>About Me</p>
                    <p className={clsx(
                        "dark:text-white text-sm font-extralight mt-3 sm:mt-4 leading-relaxed break-words text-overflow-safe",
                    )}>{
                            `I am a full-stack developer specializing in front-end, NodeJS libraries and serverless back-end development. 
                I am passionate about creating beautiful, user-friendly and efficient applications. 
                I am always looking for new challenges and opportunities to learn and grow.`
                        }</p>
                </div>
                <div className="w-full lg:w-1/2">
                    <p className={clsx(
                        "dark:text-white text-xl sm:text-2xl font-light mt-4 sm:mt-6 break-words text-overflow-safe",
                    )}>Contact Me</p>
                    <p className={clsx(
                        "dark:text-white text-sm font-extralight mt-3 sm:mt-4 break-words text-overflow-safe",
                    )}>{"Email: "}<a className="underline break-all" href="mailto:helloyork@icloud.com">helloyork@icloud.com</a>
                    </p>
                    <p className={clsx(
                        "dark:text-white text-sm font-extralight mt-2 break-words text-overflow-safe",
                    )}>{"Github: "}<a className="underline break-all" href="https://github.com/helloyork">https://github.com/helloyork</a>
                    </p>
                </div>
            </div>
        </>
    );
}

