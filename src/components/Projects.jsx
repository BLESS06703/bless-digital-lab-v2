import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { projects } from '../data/projects'

const filters = ['All', 'Web', 'Apps', 'Systems']

function Projects() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((project) => project.category === activeFilter)

  return (
    <section className="section projects-section premium-projects" id="work">
      <div className="section-heading">
        <span className="section-number">03</span>
        <span className="section-label">Selected digital products</span>
      </div>

      <div className="projects-intro">
        <div>
          <h2>
            Work that
            <span>solves problems.</span>
          </h2>
        </div>
        <p>
          Exploring practical digital solutions through software,
          applications and modern web experiences.
        </p>
      </div>

      <div className="project-filters" aria-label="Filter projects">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? 'active' : ''}
            onClick={() => setActiveFilter(filter)}
            aria-pressed={activeFilter === filter}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="premium-project-grid">
        {filteredProjects.map((project) => (
          <article className="premium-project-card" key={project.id}>
            <div className="premium-project-visual">
              <img
                src={project.image}
                alt={project.imageAlt}
                loading="lazy"
                decoding="async"
              />

              <span className="premium-project-category">
                {project.category}
              </span>

              <span className="premium-project-concept">
                UI concept reference
              </span>
            </div>

            <div className="premium-project-content">
              <div className="premium-project-meta">
                <span>{String(project.id).padStart(2, '0')}</span>
                <span className="project-status">
                  <span className="project-status-dot" />
                  {project.status}
                </span>
              </div>

              <span className="project-type">{project.type}</span>

              <h3>{project.title}</h3>

              <p>{project.description}</p>

              <div className="project-tech">
                {project.technologies.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>

              <a
                className="premium-project-link"
                href="#contact"
                aria-label={`Discuss ${project.title}`}
              >
                Discuss this project
                <ArrowUpRight size={18} />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="projects-footer">
        <span>More projects coming</span>
        <a href="#contact">
          Have a project in mind?
          <ArrowUpRight size={17} />
        </a>
      </div>
    </section>
  )
}

export default Projects
