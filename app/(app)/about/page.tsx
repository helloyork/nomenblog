import Logo from "@/app/_lib/components/logo";
import TestBlock from "@/app/_lib/components/testblock";
import Title from "@/app/_lib/elements/title";
import clsx from "clsx";


export default function Page() {
    return (
        <>
            <Title title="Nomen" subtitle="Front-end, NodeJS library, Serverless back-end developer" />
            <div className={clsx(
                " text-left",
                "flex row-auto justify-start items-start",
            )}>
                <div className="w-1/2">
                    <p className={clsx(
                        `text-white text-2xl font-light mt-6`,
                    )}>About Me</p>
                    <p className={clsx(
                        `text-white text-sm font-extralight mt-4`,
                    )}>{
                            `I am a full-stack developer specializing in front-end, NodeJS libraries and serverless back-end development. 
                I am passionate about creating beautiful, user-friendly and efficient applications. 
                I am always looking for new challenges and opportunities to learn and grow.`
                        }</p>
                </div>
                <div className="w-1/2">
                    <p className={clsx(
                        `text-white text-2xl font-light mt-6`,
                    )}>Contact Me</p>
                    <p className={clsx(
                        `text-white text-sm font-extralight mt-4`,
                    )}>{"Email: "}<a className=" underline " href="mailto:helloyork@icloud.com">hellohork@icloud.com</a>
                    </p>
                    <p className={clsx(
                        `text-white text-sm font-extralight mt-4`,
                    )}>{"Github: "}<a className=" underline " href="https://github.com/helloyork">https://github.com/helloyork</a>
                    </p>
                </div>
            </div>
        </>
    );
}

