import { logger } from "@dojot/dojot-module-logger";
import bodyParser = require("body-parser");
import express = require("express");
import { DojotSnoop } from "./DojotSnoop";

export class Server {
    protected app: express.Application;
    protected port: number;
    protected snoop: DojotSnoop;

    constructor(port: number, snoop: DojotSnoop) {
        this.snoop = snoop;
        this.app = express();
        this.app.use(bodyParser.json());
        this.port = port;
    }

    public init() {
        this.registerEndpoints();
        this.app.listen(this.port, () => {
            logger.info(`Listening on port ${this.port}.`);
        });
    }

    protected registerEndpoints() {
        this.app.get("/metrics/:subject", (req, res) => {
            if (!(req.params.subject in this.snoop.metricsRegistry)) {
                return res.status(404).send(`subject ${req.params.subject} not being analyzed`);
            }
            const messageCounter = this.snoop.metricsRegistry[req.params.subject].messageCounter;
            const accumulated = this.snoop.metricsRegistry[req.params.subject].accumulated;
            return res.status(200).send({ accumulated, messageCounter });
        });

        this.app.delete("/metrics/:subject", (req, res) => {
            if (!(req.params.subject in this.snoop.metricsRegistry)) {
                return res.status(404).send("subject not being analyzed");
            }
            this.snoop.metricsRegistry[req.params.subject].clearMessageCounters();
            return res.status(200).send();
        });

        this.app.put("/metrics/:subject", (req, res) => {
            if (!(req.params.subject in this.snoop.metricsRegistry)) {
                return res.status(404).send("subject not being analyzed");
            }
            this.snoop.metricsRegistry[req.params.subject].blockSize = req.body.blockSize;
            return res.status(200).send();
        });

        this.app.get("/mean/:subject", (req, res) => {
            if (!(req.params.subject in this.snoop.metricsRegistry)) {
                return res.status(404).send("subject not being analyzed");
            }
            let curr = 0;
            const ret = [];
            const subject = req.params.subject;
            const accumulated = this.snoop.metricsRegistry[subject].accumulated;
            const blockSize = this.snoop.metricsRegistry[subject].blockSize;
            for (const data of accumulated) {
                const value = (blockSize / (data - curr)) * 1000;
                curr = data;
                ret.push(`${value} msg/s`);
            }
            return res.status(200).send({ ret });
        });

        this.app.post("/subjects/:subject", (req, res) => {
            this.snoop.addSubject(req.params.subject);
            return res.status(200).send();
        });
    }
}
