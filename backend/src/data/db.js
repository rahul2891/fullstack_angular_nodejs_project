/**
 * db.js
 * ---------------------------------------------------------------------------
 * This is a deliberately simple in-memory "database" so the whole project
 * can run with zero external services (no Postgres/Mongo to install).
 *
 * In a real production backend you would swap this module for a real
 * persistence layer (Prisma + Postgres, Mongoose + MongoDB, etc). Every
 * controller in this project only talks to the functions exported here,
 * so swapping the implementation later would NOT require touching any
 * route or controller - that's the same separation-of-concerns idea you
 * get from Angular services sitting behind components.
 * ---------------------------------------------------------------------------
 */

const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
};

const passwordHash = bcrypt.hashSync('Password123!', 8);

/** @type {Array<object>} */
const users = [
  {
    id: 'u-1',
    name: 'Asha Rao',
    email: 'admin@pulseboard.dev',
    password: passwordHash,
    role: ROLES.ADMIN,
    avatarColor: '#7C5CFC',
  },
  {
    id: 'u-2',
    name: 'Marcus Lee',
    email: 'manager@pulseboard.dev',
    password: passwordHash,
    role: ROLES.MANAGER,
    avatarColor: '#FF8A5B',
  },
  {
    id: 'u-3',
    name: 'Priya Singh',
    email: 'member@pulseboard.dev',
    password: passwordHash,
    role: ROLES.MEMBER,
    avatarColor: '#2BB7A3',
  },
  {
    id: 'u-4',
    name: 'Diego Fernandez',
    email: 'diego@pulseboard.dev',
    password: passwordHash,
    role: ROLES.MEMBER,
    avatarColor: '#E25C8A',
  },
];

/** @type {Array<object>} */
const projects = [
  {
    id: 'p-1',
    key: 'PB',
    name: 'PulseBoard Core',
    description: 'The main product: boards, issues, workflow.',
    memberIds: ['u-1', 'u-2', 'u-3', 'u-4'],
    createdAt: new Date('2026-01-10').toISOString(),
  },
  {
    id: 'p-2',
    key: 'INFRA',
    name: 'Infrastructure',
    description: 'CI/CD, hosting, observability.',
    memberIds: ['u-1', 'u-2'],
    createdAt: new Date('2026-02-02').toISOString(),
  },
];

const STATUSES = ['backlog', 'in_progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

/** @type {Array<object>} */
const issues = [
  {
    id: 'i-1',
    projectId: 'p-1',
    key: 'PB-1',
    title: 'Set up NgRx store for issues feature',
    description: 'Create entity adapter, actions, reducer, selectors and effects for the issues slice.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'u-3',
    reporterId: 'u-2',
    checklist: [
      { id: uuid(), text: 'Define entity state', done: true },
      { id: uuid(), text: 'Write effects for CRUD', done: false },
      { id: uuid(), text: 'Write selectors', done: false },
    ],
    labels: ['frontend', 'state-management'],
    createdAt: new Date('2026-03-01').toISOString(),
    updatedAt: new Date('2026-03-05').toISOString(),
  },
  {
    id: 'i-2',
    projectId: 'p-1',
    key: 'PB-2',
    title: 'Build drag-and-drop Kanban board',
    description: 'Issues should be draggable between status columns with optimistic updates.',
    status: 'backlog',
    priority: 'medium',
    assigneeId: 'u-4',
    reporterId: 'u-2',
    checklist: [],
    labels: ['frontend', 'ux'],
    createdAt: new Date('2026-03-02').toISOString(),
    updatedAt: new Date('2026-03-02').toISOString(),
  },
  {
    id: 'i-3',
    projectId: 'p-1',
    key: 'PB-3',
    title: 'JWT refresh token rotation',
    description: 'Implement silent refresh using an HttpOnly-style refresh token flow.',
    status: 'review',
    priority: 'urgent',
    assigneeId: 'u-1',
    reporterId: 'u-1',
    checklist: [
      { id: uuid(), text: 'Issue access + refresh tokens', done: true },
      { id: uuid(), text: 'Add refresh endpoint', done: true },
      { id: uuid(), text: 'Add Angular interceptor retry logic', done: false },
    ],
    labels: ['backend', 'security'],
    createdAt: new Date('2026-02-20').toISOString(),
    updatedAt: new Date('2026-03-10').toISOString(),
  },
  {
    id: 'i-4',
    projectId: 'p-2',
    key: 'INFRA-1',
    title: 'Dockerize frontend and backend',
    description: 'Multi-stage Dockerfiles plus docker-compose for local dev.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'u-2',
    reporterId: 'u-1',
    checklist: [],
    labels: ['devops'],
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-02-01').toISOString(),
  },
  {
    id: 'i-5',
    projectId: 'p-1',
    key: 'PB-4',
    title: 'Custom ControlValueAccessor for assignee picker',
    description: 'A reusable form control that integrates with ReactiveForms via NG_VALUE_ACCESSOR.',
    status: 'backlog',
    priority: 'low',
    assigneeId: null,
    reporterId: 'u-3',
    checklist: [],
    labels: ['frontend', 'forms'],
    createdAt: new Date('2026-03-08').toISOString(),
    updatedAt: new Date('2026-03-08').toISOString(),
  },
];

/** @type {Array<object>} */
const comments = [
  {
    id: 'c-1',
    issueId: 'i-1',
    authorId: 'u-2',
    text: 'Make sure to use createEntityAdapter so we get the normalized shape for free.',
    createdAt: new Date('2026-03-02').toISOString(),
  },
  {
    id: 'c-2',
    issueId: 'i-1',
    authorId: 'u-3',
    text: 'Will do - working on the effects today.',
    createdAt: new Date('2026-03-03').toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Accessor helpers - controllers only ever call these, never touch the
// arrays directly. This is the "repository pattern" - same spirit as
// keeping Angular components ignorant of how a service fetches its data.
// ---------------------------------------------------------------------------

const db = {
  ROLES,
  STATUSES,
  PRIORITIES,

  // Users -------------------------------------------------------------
  findUserByEmail(email) {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById(id) {
    return users.find((u) => u.id === id);
  },
  listUsers() {
    return users.map(publicUser);
  },
  createUser(user) {
    users.push(user);
    return user;
  },

  // Projects ------------------------------------------------------------
  listProjects() {
    return projects;
  },
  findProjectById(id) {
    return projects.find((p) => p.id === id);
  },
  createProject({ name, description, key, ownerId }) {
    const project = {
      id: `p-${uuid()}`,
      key: key.toUpperCase(),
      name,
      description: description || '',
      memberIds: [ownerId],
      createdAt: new Date().toISOString(),
    };
    projects.push(project);
    return project;
  },

  // Issues ------------------------------------------------------------
  listIssues({ projectId, status, assigneeId, search } = {}) {
    let result = issues;
    if (projectId) result = result.filter((i) => i.projectId === projectId);
    if (status) result = result.filter((i) => i.status === status);
    if (assigneeId) result = result.filter((i) => i.assigneeId === assigneeId);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.key.toLowerCase().includes(q)
      );
    }
    return result;
  },
  findIssueById(id) {
    return issues.find((i) => i.id === id);
  },
  createIssue(payload) {
    const project = this.findProjectById(payload.projectId);
    const countInProject = issues.filter((i) => i.projectId === payload.projectId).length;
    const issue = {
      id: `i-${uuid()}`,
      key: `${project ? project.key : 'GEN'}-${countInProject + 1}`,
      projectId: payload.projectId,
      title: payload.title,
      description: payload.description || '',
      status: payload.status || 'backlog',
      priority: payload.priority || 'medium',
      assigneeId: payload.assigneeId || null,
      reporterId: payload.reporterId,
      checklist: payload.checklist || [],
      labels: payload.labels || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    issues.push(issue);
    return issue;
  },
  updateIssue(id, patch) {
    const issue = this.findIssueById(id);
    if (!issue) return null;
    Object.assign(issue, patch, { updatedAt: new Date().toISOString() });
    return issue;
  },
  deleteIssue(id) {
    const idx = issues.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    issues.splice(idx, 1);
    return true;
  },
  isTitleDuplicateInProject(projectId, title, excludeId) {
    return issues.some(
      (i) =>
        i.projectId === projectId &&
        i.id !== excludeId &&
        i.title.trim().toLowerCase() === title.trim().toLowerCase()
    );
  },

  // Comments ------------------------------------------------------------
  listCommentsForIssue(issueId) {
    return comments
      .filter((c) => c.issueId === issueId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },
  createComment({ issueId, authorId, text }) {
    const comment = {
      id: `c-${uuid()}`,
      issueId,
      authorId,
      text,
      createdAt: new Date().toISOString(),
    };
    comments.push(comment);
    return comment;
  },
};

/** Strip the password hash before sending a user object to the client. */
function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

module.exports = { db, publicUser };
