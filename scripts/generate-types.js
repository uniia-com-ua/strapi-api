/*
 This script scans Strapi schemas and generates TypeScript interfaces.
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const API_DIR = path.join(SRC_DIR, 'api');
const OUTPUT_DIR = path.join(ROOT, 'types', 'generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'generated.ts');

/** @typedef {{ name: string, uid: string, group: string, attributes: Record<string, any> }} Component */
/** @typedef {{ name: string, uid: string, singularName: string, kind: 'collectionType'|'singleType', attributes: Record<string, any> }} ContentType */

function ensureDirSync(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function readJson(filePath) {
	const src = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(src);
}

function pascalCase(name) {
	return name
		.replace(/[^a-zA-Z0-9]+/g, ' ')
		.split(' ')
		.filter(Boolean)
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join('');
}

function toSafePropName(name) {
	return /^(?:[A-Za-z_][A-Za-z0-9_]*)$/.test(name) ? name : JSON.stringify(name);
}

function mapScalarType(attr) {
	switch (attr.type) {
		case 'string':
		case 'text':
		case 'richtext':
		case 'uid':
			return 'string';
		case 'integer':
		case 'biginteger':
		case 'float':
		case 'decimal':
		case 'number':
			return 'number';
		case 'boolean':
			return 'boolean';
		case 'date':
		case 'datetime':
		case 'time':
		case 'timestamp':
			return 'string';
		case 'email':
		case 'password':
			return 'string';
		case 'json':
			return 'any';
		case 'enumeration':
			if (Array.isArray(attr.enum) && attr.enum.length) {
				return attr.enum.map((v) => JSON.stringify(v)).join(' | ');
			}
			return 'string';
		default:
			return 'any';
	}
}

function getComponentInterfaceName(uid) {
	const [group, name] = uid.split('.');
	const base = pascalCase(name);
	if (group === 'blocks') return `${base}Block`;
	return base;
}

function getContentTypeInterfaceName(ct) {
	const source = ct.singularName || ct.name || ct.uid.split('::').pop() || 'Entity';
	return pascalCase(source);
}

function buildAttributeTsType(attr, ctx) {
	if (!attr || typeof attr !== 'object') return 'any';
	if (attr.type === 'component') {
		const compUid = attr.component; // e.g. shared.seo
		const compName = ctx.componentUidToInterface.get(compUid) || getComponentInterfaceName(compUid);
		return attr.repeatable ? `${compName}[]` : compName;
	}
	if (attr.type === 'dynamiczone') {
		const union = (attr.components || []).map((uid) => ctx.componentUidToInterface.get(uid) || getComponentInterfaceName(uid));
		return union.length ? `(${union.join(' | ')})[]` : 'any[]';
	}
	if (attr.type === 'media') {
		return attr.multiple ? 'MediaFile[]' : 'MediaFile';
	}
	if (attr.type === 'relation') {
		const target = attr.target; // e.g. api::article.article
		const targetIface = ctx.contentTypeUidToInterface.get(target) || 'number';
		const relType = attr.relation;
		switch (relType) {
			case 'oneToOne':
			case 'manyToOne':
				return `${targetIface} | number`;
			case 'oneToMany':
			case 'manyToMany':
				return `(${targetIface} | number)[]`;
			default:
				return 'any';
		}
	}
	return mapScalarType(attr);
}

function gatherComponents() {
	const results = [];
	if (!fs.existsSync(COMPONENTS_DIR)) return results;
	const groups = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
	for (const group of groups) {
		const groupDir = path.join(COMPONENTS_DIR, group.name);
		const files = fs.readdirSync(groupDir, { withFileTypes: true }).filter((d) => d.isFile() && d.name.endsWith('.json'));
		for (const file of files) {
			const filePath = path.join(groupDir, file.name);
			const json = readJson(filePath);
			const displayName = json.info?.displayName || json.info?.name || path.basename(file.name, '.json');
			const uid = `${group.name}.${path.basename(file.name, '.json')}`; // e.g. shared.seo
			results.push({ name: displayName, uid, group: group.name, attributes: json.attributes || {} });
		}
	}
	return results;
}

function gatherContentTypes() {
	const results = [];
	if (!fs.existsSync(API_DIR)) return results;
	const apis = fs.readdirSync(API_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
	for (const api of apis) {
		const ctDir = path.join(API_DIR, api.name, 'content-types');
		if (!fs.existsSync(ctDir)) continue;
		const ctNames = fs.readdirSync(ctDir, { withFileTypes: true }).filter((d) => d.isDirectory());
		for (const ctName of ctNames) {
			const schemaPath = path.join(ctDir, ctName.name, 'schema.json');
			if (!fs.existsSync(schemaPath)) continue;
			const json = readJson(schemaPath);
			const uid = `api::${api.name}.${ctName.name}`; // standard UID
			const singularName = json.info?.singularName || ctName.name;
			results.push({ name: json.info?.displayName || ctName.name, singularName, uid, kind: json.kind, attributes: json.attributes || {} });
		}
	}
	return results;
}

function parseCliArgs(argv) {
	const args = {};
	for (let i = 2; i < argv.length; i++) {
		const part = argv[i];
		if (part.startsWith('--')) {
			if (part.includes('=')) {
				const [k, ...rest] = part.slice(2).split('=');
				args[k] = rest.length ? rest.join('=') : 'true';
			} else {
				const k = part.slice(2);
				const maybeVal = argv[i + 1];
				if (maybeVal && !maybeVal.startsWith('--')) {
					args[k] = maybeVal;
					i += 1;
				} else {
					args[k] = 'true';
				}
			}
		}
	}
	return args;
}

function generate() {
	const components = gatherComponents();
	const contentTypes = gatherContentTypes();

	const componentUidToInterface = new Map();
	const contentTypeUidToInterface = new Map();

	for (const comp of components) {
		componentUidToInterface.set(comp.uid, getComponentInterfaceName(comp.uid));
	}
	for (const ct of contentTypes) {
		contentTypeUidToInterface.set(ct.uid, getContentTypeInterfaceName(ct));
	}

	const ctx = { componentUidToInterface, contentTypeUidToInterface };

	// Read version from package.json
	let releaseVersion = '0.0.0';
	try {
		const pkg = readJson(path.join(ROOT, 'package.json'));
		releaseVersion = typeof pkg.version === 'string' ? pkg.version : releaseVersion;
	} catch {}

	// Read release URL from CLI or env
	const args = parseCliArgs(process.argv);
	const releaseUrl =
		args['release-url'] ||
		process.env.GITHUB_RELEASE_URL ||
		process.env.RELEASE_URL ||
		process.env.npm_config_release_url ||
		'';

	let out = '';
	out += "// This file is auto-generated by scripts in https://github.com/uniia-com-ua/strapi-api.git.\n";
	out += `// Release Version is ${releaseVersion}\n`;
	if (releaseUrl) {
		out += `// Release URL: ${releaseUrl}\n`;
	}
	out += "// Do not edit manually. If the generator has not been run yet,\n";
	out += "// this fallback keeps the SDK buildable.\n\n";
	out += "// Additive map of CMS block UIDs to their TS interfaces.\n";
	out += "// The generator will overwrite this file with concrete definitions.\n";

	out += "export interface MediaFile { id?: number; url?: string; name?: string; alternativeText?: string | null; caption?: string | null; width?: number | null; height?: number | null; formats?: any; mime?: string; size?: number; }\n\n";

	// Components
	for (const comp of components) {
		const ifaceName = componentUidToInterface.get(comp.uid);
		out += `export interface ${ifaceName} {\n`;
		out += `\t__component: ${JSON.stringify(comp.uid)};\n`;
		out += `\tid?: number;\n`;
		for (const [attrName, attr] of Object.entries(comp.attributes)) {
			const tsType = buildAttributeTsType(attr, ctx);
			const optional = attr.required ? '' : '?';
			out += `\t${toSafePropName(attrName)}${optional}: ${tsType};\n`;
		}
		out += `}\n\n`;
	}

	// Content Types
	for (const ct of contentTypes) {
		const ifaceName = contentTypeUidToInterface.get(ct.uid);
		out += `export interface ${ifaceName} {\n`;
		out += `\tid?: number;\n`;
		for (const [attrName, attr] of Object.entries(ct.attributes)) {
			const tsType = buildAttributeTsType(attr, ctx);
			const optional = attr.required ? '' : '?';
			out += `\t${toSafePropName(attrName)}${optional}: ${tsType};\n`;
		}
		out += `}\n\n`;
	}

	// Block map: only blocks.* components
	const blockUids = components.filter((c) => c.group === 'blocks').map((c) => c.uid).sort();
	out += `export interface CMSBlockMapGenerated {\n`;
	for (const uid of blockUids) {
		const ifaceName = componentUidToInterface.get(uid);
		if (ifaceName) {
			out += `\t${JSON.stringify(uid)}: ${ifaceName};\n`;
		}
	}
	out += `}\n`;

	ensureDirSync(OUTPUT_DIR);
	fs.writeFileSync(OUTPUT_FILE, out, 'utf8');
	console.log(`Generated ${path.relative(ROOT, OUTPUT_FILE)}`);
}

try {
	generate();
} catch (err) {
	console.error('Failed to generate types:', err);
	process.exit(1);
}
