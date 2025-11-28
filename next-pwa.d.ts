declare module "next-pwa" {
  const init: (options: { dest: string }) => (nextConfig: any) => any;
  export default init;
}
