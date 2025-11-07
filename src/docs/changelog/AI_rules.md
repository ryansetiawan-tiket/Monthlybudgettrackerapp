🧠 AI Code Assistant Rules
Applicable for all AI-assisted coding tools such as Figma Make, Cursor, Trae, Continue, Windsurf, GitHub Copilot Workspace, and similar environments.
 These rules ensure clarity, consistency, and reliability across all code generation workflows.

🧩 Core Behavior
Verify Information
 Always verify information before presenting it. Do not make assumptions or speculate without clear evidence.


No Inventions
 Don't invent code, logic, or structure that isn't explicitly requested.


No Guesswork
 If something is unclear, state it explicitly instead of making assumptions.


No Apologies or Politeness
 Never use apologies or conversational fillers (e.g., "I understand", "Sure", "Got it").


No Summaries or Explanations
 Don't summarize the work done or explain reasoning unless explicitly requested.


🗂 File Handling & Edit Rules
File-by-File Changes
 Make changes file by file and allow the user to review after each file.


Single Chunk Edits
 Provide edits in one complete code block, not step-by-step.


Preserve Existing Code
 Don't alter unrelated or stable parts of the file.


No Whitespace or Formatting Changes
 Only modify what's explicitly required.


No Unnecessary Updates
 Don't touch files if no meaningful change is needed.


Context Awareness
 Always check the context-generated file content before applying changes.


No Current Implementation Review
 Don't restate or discuss existing implementations unless asked.


Provide Real File Links
 When referencing files, use actual file paths or URLs—not generated placeholders.


⚙️ Coding Principles
Explicit Variable Names
 Prefer clear, descriptive variable names over short or ambiguous ones.


Follow Existing Style
 Match the project's coding conventions and formatting style.


Linter Compliance
 Always ensure that generated or modified code passes existing linting and formatting rules (e.g., ESLint, Prettier, Stylelint).
 Do not introduce code that violates project linter configurations.
 If a linter rule conflicts with a requested change, mention it explicitly instead of ignoring it.


Performance-Aware
 Optimize where possible, but avoid premature optimization.


Security-First
 Always consider data safety, validation, and privacy when making changes.


Error Handling
 Include robust error handling and fallback behavior.


Avoid Magic Numbers
 Replace hardcoded values with named constants for clarity and maintainability.


Consider Edge Cases
 Account for exceptional or boundary input scenarios.


Version Compatibility
 Ensure changes are compatible with the project's current framework and library versions.


Avoid Code Duplication
 Reuse existing utilities or functions wherever possible.


Encourage Modularity
 Use modular design principles to improve reusability and maintainability.


Assertions & Validations
 Add checks or assertions to ensure logic consistency.


Test Coverage
 Include or suggest appropriate test cases for new or modified logic.


🧭 Collaboration & Review
No Unnecessary Confirmations
 Don't ask for confirmation about known context or provided information.


Don't Comment on Understanding
 Avoid meta-comments like "I understand" or "This means you want…".


Use Deterministic Language
 Avoid vague phrasing like "maybe", "should be", or "looks like". Be clear and definitive.


Traceability
 When making major logic changes, briefly note which part of the context it aligns with (e.g., "Aligned with updateFeatureStatus() in ProjectList.js").


Atomic Commits (Optional)
 If versioning is used, group logically related changes into one commit or patch.


Prevent Linter Drift
 Do not auto-correct, disable, or bypass linting rules.
 All fixes must comply with the project's configured linter and formatter.


🧩 Advanced Rules (Optional but Recommended)
Respect Existing Comments
 Don't remove or overwrite developer comments unless they contradict new instructions.


Keep UI Behavior Intact
 Ensure layout, event flow, and bindings remain unchanged unless modification is explicitly requested.


Dependency Integrity
 Don't add or remove dependencies without approval.


Consistent Data Flow
 Maintain consistent state/prop flow in React, Vue, or similar frameworks.


Avoid Over-Engineering
 Prefer simple, maintainable solutions over complex abstractions.


🎯 ExpenseList-Specific Rules
CRITICAL: Multiple Rendering Paths
 ExpenseList.tsx has 2 rendering paths and 2 expense types:
 - **Path 1**: Responsive Layout (mobile/desktop variants)
 - **Path 2**: Tab View (`renderExpenseItem` function)
 - **Type 1**: Template expense (with multiple items, collapsible)
 - **Type 2**: Single expense (without items)
 
 **RULE**: When making ANY change to expense items UI/UX, you MUST update ALL 6 sections:
 1. Template expense - Responsive Mobile
 2. Template expense - Responsive Desktop
 3. Single expense - Responsive Mobile
 4. Single expense - Responsive Desktop
 5. Template expense - Tab View (renderExpenseItem)
 6. Single expense - Tab View (renderExpenseItem)
 
 **DO NOT** differentiate or separate changes between template and single expenses.
 **ALWAYS** apply the same change to BOTH types in BOTH paths.
 
 Failure to do this will result in UI inconsistencies where some expense entries look different from others.


🎨 UI Consistency Rules
More Button Pattern (Edit/Delete Actions)
 ALL entry types (expenses, incomes, etc.) MUST use the "More" dropdown button pattern for Edit and Delete actions:
 
 **Pattern**:
 ```tsx
 <DropdownMenu>
   <DropdownMenuTrigger asChild>
     <Button variant="ghost" size="icon" className="h-8 w-8" title="More">
       <MoreVertical className="size-3.5 text-muted-foreground" />
     </Button>
   </DropdownMenuTrigger>
   <DropdownMenuContent align="end">
     <DropdownMenuItem onClick={handleEdit}>
       <Pencil className="size-3.5 mr-2" />
       Edit
     </DropdownMenuItem>
     <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
       <Trash2 className="size-3.5 mr-2" />
       Hapus
     </DropdownMenuItem>
   </DropdownMenuContent>
 </DropdownMenu>
 ```
 
 **DO NOT**:
 - ❌ Create separate Edit and Delete buttons
 - ❌ Use different button patterns for different entry types
 - ❌ Change the icon sizes or spacing
 - ❌ Remove the "More" dropdown pattern
 
 **Applies to**:
 - Expense entries (single & template)
 - Income entries (additional income)
 - Any future entry types
 
 **Exception**: Exclude/Include (Eye/EyeOff) button remains separate as it's a toggle, not a destructive action.


✅ Summary
This rule set ensures that AI-assisted tools produce reliable, consistent, and linter-compliant code — with zero speculation, minimal noise, and maximum maintainability.

