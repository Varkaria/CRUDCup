function App() {
  return (
    <>
      <header>
        <div className="space-y-4">
          <img src="/logo.svg" className="h-10" />
          <h1 className="text-2xl">
            A simple <b>CRUD</b> (Create Read Update Delete) API with lightning
            fast performance with bun.js and easy to use.
          </h1>
          <div className="flex items-center gap-2 text-black/60 text-sm">
            Created by{' '}
            <a
              href="https://github.com/ST4RCHASER"
              className="flex gap-2 items-center text-black font-medium"
            >
              <img
                src="https://avatars.githubusercontent.com/u/32775520?v=4"
                alt="_StarChaser"
                className="w-6 h-6 rounded-full"
              />
              _StarChaser
            </a>
          </div>
        </div>
      </header>
      <main>
        <div className="opacity-60 font-medium">Playground Here</div>
      </main>
      <article>
        <div className="opacity-60 font-medium">How to use Here</div>
      </article>
    </>
  )
}

export default App
