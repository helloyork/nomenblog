
import Title from "@/app/_lib/elements/title";
import clsx from "clsx";


export default function Page() {
    return (
        <>
            <Title title="Nomen" subtitle="Front-end, NodeJS library, Serverless back-end developer" />
            <div className={clsx(
                " text-left",
                "flex flex-col sm:flex-row justify-start items-start",
            )}>
                <div className="w-full sm:w-1/2 mr-5">
                    <p className={clsx(
                        "dark:text-white text-2xl font-light mt-6",
                    )}>About Me</p>
                    <p className={clsx(
                        "dark:text-white text-sm font-extralight mt-4",
                    )}>{
                            `I am a full-stack developer specializing in front-end, NodeJS libraries and serverless back-end development. 
                I am passionate about creating beautiful, user-friendly and efficient applications. 
                I am always looking for new challenges and opportunities to learn and grow.`
                        }</p>
                </div>
                <div className="w-full sm:w-1/2 mr-5">
                    <p className={clsx(
                        "dark:text-white text-2xl font-light mt-6",
                    )}>Contact Me</p>
                    <p className={clsx(
                        "dark:text-white text-sm font-extralight mt-4",
                    )}>{"Email: "}<a className=" underline " href="mailto:helloyork@icloud.com">hellohork@icloud.com</a>
                    </p>
                    <p className={clsx(
                        "dark:text-white text-sm font-extralight",
                    )}>{"Github: "}<a className=" underline " href="https://github.com/helloyork">https://github.com/helloyork</a>
                    </p>
                </div>
            </div>
        </>
    );
}

