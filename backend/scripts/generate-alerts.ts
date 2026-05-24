import { v4 as uuidv4 } from 'uuid';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type Status = 'new' | 'investigating' | 'resolved' | 'false_positive';
type Category =
  | 'malware'
  | 'phishing'
  | 'unauthorized_access'
  | 'data_exfiltration'
  | 'policy_violation'
  | 'suspicious_login';
type Source = 'endpoint-agent' | 'email-gateway' | 'firewall' | 'cloud-audit';

export interface AlertData {
  id: string;
  timestamp: Date;
  title: string;
  severity: Severity;
  severityRank: number;
  status: Status;
  category: Category;
  source: Source;
  affectedAsset: string;
  assignee: string | null;
  description: string;
  rawEvent: string;
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTimestamp(): Date {
  const now = Date.now();
  const sixWeeksMs = 42 * 24 * 60 * 60 * 1000;
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
  const inRecent = Math.random() < 0.6;
  const offset = inRecent
    ? Math.random() * twoWeeksMs
    : twoWeeksMs + Math.random() * (sixWeeksMs - twoWeeksMs);
  return new Date(now - offset);
}

function randomIp() {
  return `${randInt(10, 192)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}

function randomHostname() {
  const prefixes = ['ws', 'srv', 'dev', 'lap', 'wkst'];
  const depts = ['fin', 'eng', 'hr', 'ops', 'sec'];
  return `${randItem(prefixes)}-${randItem(depts)}-${randInt(10, 99)}`;
}

function randomEmail(domain = 'corp.internal') {
  const names = ['jsmith', 'adavis', 'mchen', 'lgarcia', 'bwilson', 'kpatel', 'rthomas', 'njones'];
  return `${randItem(names)}@${domain}`;
}

function randomArn() {
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
  const services = ['s3', 'ec2', 'iam', 'lambda'];
  const acct = `${randInt(100000000000, 999999999999)}`;
  return `arn:aws:${randItem(services)}:${randItem(regions)}:${acct}:resource/${uuidv4().slice(0, 8)}`;
}

const severityRankMap: Record<Severity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

const SEVERITIES: Severity[] = ['info', 'low', 'medium', 'high', 'critical'];
const SEVERITY_WEIGHTS = [35, 30, 20, 10, 5];

const STATUSES: Status[] = ['new', 'investigating', 'resolved', 'false_positive'];
const STATUS_WEIGHTS = [45, 25, 20, 10];

const CATEGORIES: Category[] = [
  'malware',
  'phishing',
  'unauthorized_access',
  'data_exfiltration',
  'policy_violation',
  'suspicious_login',
];

const SOURCES: Source[] = ['endpoint-agent', 'email-gateway', 'firewall', 'cloud-audit'];

const ANALYSTS = ['sarah.k', 'mike.r', 'priya.n', 'tom.b', 'elena.v'];

function titleForCategory(cat: Category, source: Source): string {
  const host = randomHostname();
  const ip = randomIp();
  const user = randomEmail().split('@')[0];

  const titles: Record<Category, string[]> = {
    malware: [
      `Ransomware activity detected on ${host}`,
      `Trojan dropper executed on ${host}`,
      `Suspicious process injection on ${host}`,
      `Known malware hash found on ${host}`,
      `C2 beacon detected from ${host}`,
    ],
    phishing: [
      `Phishing link clicked by ${user}`,
      `Credential harvesting page visited from ${host}`,
      `Malicious attachment opened by ${user}`,
      `BEC attempt targeting ${user}`,
    ],
    unauthorized_access: [
      `Admin account access from unusual location: ${ip}`,
      `SSH brute force on ${host} from ${ip}`,
      `Privilege escalation attempt on ${host}`,
      `Lateral movement detected from ${host} to ${ip}`,
    ],
    data_exfiltration: [
      `Large data upload to external host from ${host}`,
      `Sensitive file access spike on ${host}`,
      `Unusual outbound traffic volume from ${ip}`,
      `Cloud storage sync of restricted data by ${user}`,
    ],
    policy_violation: [
      `Prohibited software installed on ${host}`,
      `USB device connected to ${host}`,
      `Out-of-hours login from ${user}`,
      `Unapproved SaaS tool accessed by ${user}`,
    ],
    suspicious_login: [
      `Impossible travel detected for ${user}`,
      `Multiple failed logins for ${user} from ${ip}`,
      `Login from new device for ${user}`,
      `Credential stuffing attempt against ${user}`,
    ],
  };

  return randItem(titles[cat]);
}

function descriptionForCategory(cat: Category): string {
  const descs: Record<Category, string[]> = {
    malware: [
      'Endpoint protection flagged suspicious process behavior consistent with known ransomware patterns. File system changes and shadow copy deletion observed.',
      'A process matching known trojan signatures was executed. Network callbacks to suspicious external IPs detected shortly after execution.',
      'Memory injection technique detected. A process attempted to write executable code into a foreign process address space.',
    ],
    phishing: [
      'User navigated to a URL matching a known phishing domain. Credentials may have been entered before the page was blocked.',
      'Email containing a malicious attachment was opened. Macro execution was attempted but blocked by endpoint controls.',
      'Suspected business email compromise. A spoofed sender domain was used to request a wire transfer.',
    ],
    unauthorized_access: [
      'Multiple authentication failures followed by a successful login from an IP address not previously associated with this account.',
      'Lateral movement detected. A host that does not normally initiate connections began scanning internal subnets.',
      'Privilege escalation commands were run within minutes of a remote session being established.',
    ],
    data_exfiltration: [
      'An unusually large volume of data was transferred to an external destination over a short period. The destination IP has no prior activity history.',
      'Sensitive documents were accessed at a rate significantly above the user baseline and then synced to a personal cloud storage account.',
    ],
    policy_violation: [
      'A software title on the prohibited list was detected running on a managed endpoint. The installation bypassed standard software deployment controls.',
      'A USB storage device was connected to a workstation in a restricted zone. Data transfer activity was observed before the device was ejected.',
    ],
    suspicious_login: [
      'The same account authenticated from two geographically distant locations within a timeframe that makes physical travel impossible.',
      'A sequence of failed authentication attempts matching credential stuffing patterns was detected against this account.',
      'The user account was accessed from a device fingerprint that has not been seen before. The session originated from an anonymizing proxy.',
    ],
  };

  return randItem(descs[cat]);
}

function affectedAssetForSource(source: Source): string {
  switch (source) {
    case 'endpoint-agent':
      return randomHostname();
    case 'email-gateway':
      return randomEmail();
    case 'firewall':
      return randomIp();
    case 'cloud-audit':
      return randomArn();
  }
}

function rawEventForSource(source: Source): object {
  switch (source) {
    case 'endpoint-agent':
      return {
        process_name: randItem(['svchost.exe', 'powershell.exe', 'cmd.exe', 'wscript.exe', 'rundll32.exe']),
        process_id: randInt(1000, 65535),
        parent_process: randItem(['explorer.exe', 'services.exe', 'lsass.exe']),
        file_path: `C:\\Users\\${randItem(['Public', 'Temp', 'AppData'])}\\${uuidv4().slice(0, 8)}.exe`,
        hash_md5: Array.from({ length: 32 }, () => randInt(0, 15).toString(16)).join(''),
        user_context: randomEmail().split('@')[0],
      };
    case 'email-gateway':
      return {
        from: randomEmail('external.com'),
        to: randomEmail(),
        subject: randItem([
          'Urgent: Invoice attached',
          'Your account requires verification',
          'Action required: security update',
          'Meeting request',
        ]),
        attachment: randItem([null, 'invoice.xlsm', 'document.docm', 'report.pdf']),
        spf_result: randItem(['pass', 'fail', 'softfail']),
        dkim_result: randItem(['pass', 'fail']),
        url_count: randInt(0, 5),
      };
    case 'firewall':
      return {
        src_ip: randomIp(),
        dst_ip: randomIp(),
        src_port: randInt(1024, 65535),
        dst_port: randItem([22, 80, 443, 3389, 445, 8080, 3306]),
        protocol: randItem(['TCP', 'UDP', 'ICMP']),
        action: randItem(['block', 'allow', 'alert']),
        bytes_sent: randInt(0, 50000000),
        bytes_received: randInt(0, 5000000),
        rule_id: `FW-${randInt(1000, 9999)}`,
      };
    case 'cloud-audit':
      return {
        user_identity: randomEmail(),
        event_name: randItem([
          'GetSecretValue',
          'PutObject',
          'DescribeInstances',
          'CreateAccessKey',
          'DeleteBucket',
          'AssumeRole',
        ]),
        source_ip: randomIp(),
        user_agent: randItem(['aws-sdk-python', 'aws-cli/2.x', 'Boto3/1.x', 'Terraform/1.x']),
        region: randItem(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']),
        resource_arn: randomArn(),
        mfa_used: Math.random() > 0.4,
      };
  }
}

export function generateAlerts(count: number): AlertData[] {
  const alerts: AlertData[] = [];

  for (let i = 0; i < count; i++) {
    const severity = weightedPick(SEVERITIES, SEVERITY_WEIGHTS);
    const status = weightedPick(STATUSES, STATUS_WEIGHTS);
    const category = randItem(CATEGORIES);
    const source = randItem(SOURCES);
    const timestamp = generateTimestamp();

    // assignee: simple random pick, not weighted — ~40% null
    const assignee =
      Math.random() < 0.4 ? null : ANALYSTS[Math.floor(Math.random() * ANALYSTS.length)];

    alerts.push({
      id: uuidv4(),
      timestamp,
      title: titleForCategory(category, source),
      severity,
      severityRank: severityRankMap[severity],
      status,
      category,
      source,
      affectedAsset: affectedAssetForSource(source),
      assignee,
      description: descriptionForCategory(category),
      rawEvent: JSON.stringify(rawEventForSource(source)),
    });
  }

  return alerts;
}
