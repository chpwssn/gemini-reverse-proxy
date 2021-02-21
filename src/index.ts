import * as tls from "tls";
import * as fs from "fs";
import * as url from "url";
const upstreams: UpstreamMap = require(process.env.UPSTREAM_PATH ??
    "../upstreams.json");

interface UpstreamMap {
    [key: string]: {
        host: string;
        port: number;
    };
}

class ReverseProxy {
    key;
    cert;

    constructor(key, cert) {
        this.key = key;
        this.cert = cert;
    }

    listen(callback: any = null, port: number = 1965) {
        // Create a TLS server, this one must be served with
        let s = tls.createServer(
            {
                key: this.key,
                cert: this.cert,
                requestCert: true,
                rejectUnauthorized: false,
            },
            (conn) => {
                conn.setEncoding("utf8");
                conn.on("data", (data) => {
                    let u = new url.URL(data);
                    if (!Object.keys(upstreams).includes(u.host)) {
                        // TODO return information to the client?
                        conn.destroy();
                        return;
                    }
                    const upstream = upstreams[u.host];
                    // Connect to the upstream host but ignore self signed certs
                    const serviceSocket = tls.connect(
                        { ...upstream, servername: u.host, rejectUnauthorized: false },
                        () => {
                            serviceSocket.write(data);
                        }
                    );
                    serviceSocket.setEncoding("utf8");
                    serviceSocket.on("data", (data) => {
                        conn.write(data);
                    });
                    serviceSocket.on("error", console.error);
                    serviceSocket.on("close", () => {
                        console.log(new Date().getTime(), "remote closed connection");
                        conn.destroy();
                    });
                });
            }
        );
        s.listen(port, callback);
    }
}

const options = {
    cert: fs.readFileSync(process.env.CERT_PATH ?? "cert.pem"),
    key: fs.readFileSync(process.env.KEY_PATH ?? "key.pem"),
};

// Generate a reverse proxy instance
const proxy = new ReverseProxy(options.key, options.cert);
const port = process.env.PORT ? Number(process.env.PORT) : 1965;
// Start the instance listening, this will continue forever
proxy.listen(() => console.log(`Listening on port ${port}`), port);
