import ProdLogger from './prod-logger';
import DevLogger from './dev-logger';
import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;

const loggerInit = (labelName: string) => {
    return NODE_ENV === 'Production' ? ProdLogger(labelName) : DevLogger(labelName);
}

export default loggerInit;

