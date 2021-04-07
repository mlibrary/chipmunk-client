export default class PackagingListener {
  packaging (artifact) {}
  packaged (artifact) {}
  failed (artifact) {}
  done () {}
}

export { PackagingListener }
